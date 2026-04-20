import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, Wallet, Users, Clock, ArrowLeft,
  Edit3, Save, Plus, Trash2, ChevronDown, ChevronUp,
  Hotel, UtensilsCrossed, Landmark, Star, DollarSign,
  FileText, Upload, Download, X, Sparkles, Printer,
  Sun, Sunset, Moon, AlertCircle
} from 'lucide-react';
import useTrips from '../hooks/useTrips';
import useGroqAI from '../hooks/useGroqAI';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import './TripDetailPage.css';

/**
 * TripDetailPage — Full trip view with tabbed interface
 * Tabs: Itinerary, Budget, Suggestions, Notes & Docs, Summary
 */
const TripDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTripById, updateTrip } = useTrips();
  const { generateItinerary, suggestHotels, suggestRestaurants, suggestPlaces, generateExpenseBreakdown, loading: aiLoading } = useGroqAI();

  const trip = getTripById(id);
  const [activeTab, setActiveTab] = useState('itinerary');
  const [editingActivity, setEditingActivity] = useState(null);
  const [expandedDays, setExpandedDays] = useState({});
  const [notes, setNotes] = useState(trip?.notes || '');
  const [newDocName, setNewDocName] = useState('');
  const fileInputRef = useRef(null);
  const [showAddActivity, setShowAddActivity] = useState(null);
  const [newActivity, setNewActivity] = useState({ time: '', title: '', description: '', period: 'morning', estimatedCost: 0 });

  // Sync notes with trip
  useEffect(() => {
    if (trip) {
      setNotes(trip.notes || '');
    }
  }, [trip]);

  // Auto-save notes with debounce
  const notesTimeoutRef = useRef(null);
  const handleNotesChange = useCallback((e) => {
    const value = e.target.value;
    setNotes(value);
    if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current);
    notesTimeoutRef.current = setTimeout(() => {
      updateTrip(id, { notes: value });
    }, 800);
  }, [id, updateTrip]);

  const toggleDay = useCallback((dayNum) => {
    setExpandedDays((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  }, []);

  // ===== ITINERARY EDITING =====
  const removeActivity = useCallback((dayIndex, actIndex) => {
    const newDays = [...(trip.itinerary?.days || [])];
    newDays[dayIndex] = {
      ...newDays[dayIndex],
      activities: newDays[dayIndex].activities.filter((_, i) => i !== actIndex),
    };
    updateTrip(id, { itinerary: { ...trip.itinerary, days: newDays } });
  }, [id, trip, updateTrip]);

  const addActivity = useCallback((dayIndex) => {
    if (!newActivity.title.trim() || !newActivity.time.trim()) return;
    const newDays = [...(trip.itinerary?.days || [])];
    const activity = {
      ...newActivity,
      id: `custom_${Date.now()}`,
      estimatedCost: Number(newActivity.estimatedCost) || 0,
      category: 'activity',
      duration: '1-2 hours',
      location: trip.destination,
    };
    newDays[dayIndex] = {
      ...newDays[dayIndex],
      activities: [...(newDays[dayIndex].activities || []), activity],
    };
    updateTrip(id, { itinerary: { ...trip.itinerary, days: newDays } });
    setNewActivity({ time: '', title: '', description: '', period: 'morning', estimatedCost: 0 });
    setShowAddActivity(null);
  }, [id, trip, updateTrip, newActivity]);

  // ===== EXPENSE EDITING =====
  const updateExpenseAmount = useCallback((catIndex, amount) => {
    if (!trip.expenses?.categories) return;
    const newCategories = [...trip.expenses.categories];
    newCategories[catIndex] = { ...newCategories[catIndex], amount: Number(amount) || 0 };
    const total = newCategories.reduce((sum, c) => sum + c.amount, 0);
    // Recalculate percentages
    newCategories.forEach((cat) => {
      cat.percentage = total > 0 ? Math.round((cat.amount / total) * 100) : 0;
    });
    updateTrip(id, {
      expenses: {
        ...trip.expenses,
        categories: newCategories,
        totalEstimated: total,
        perDay: Math.round(total / (trip.numDays || 1)),
        perPerson: Math.round(total / (trip.travelers || 1)),
      },
    });
  }, [id, trip, updateTrip]);

  // ===== DOCUMENTS =====
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const doc = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        data: ev.target.result,
        uploadedAt: new Date().toISOString(),
      };
      const docs = [...(trip.documents || []), doc];
      updateTrip(id, { documents: docs });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [id, trip, updateTrip]);

  const removeDocument = useCallback((docId) => {
    const docs = (trip.documents || []).filter((d) => d.id !== docId);
    updateTrip(id, { documents: docs });
  }, [id, trip, updateTrip]);

  const downloadDocument = useCallback((doc) => {
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = doc.name;
    link.click();
  }, []);

  // ===== REGENERATE =====
  const handleRegenerate = useCallback(async () => {
    const prefs = [trip.preferences, trip.allergies, trip.interests].filter(Boolean).join('. ');
    const itinerary = await generateItinerary({
      destination: trip.destination,
      days: trip.numDays,
      budget: trip.budget,
      travelers: trip.travelers,
      preferences: prefs,
    });
    if (itinerary) {
      updateTrip(id, { itinerary });
      const expenses = await generateExpenseBreakdown(itinerary, trip.budget, trip.travelers);
      if (expenses) updateTrip(id, { expenses });
    }
  }, [trip, id, updateTrip, generateItinerary, generateExpenseBreakdown]);

  // Total expenses — useMemo optimization
  const totalExpenses = useMemo(() => {
    return trip?.expenses?.categories?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
  }, [trip?.expenses?.categories]);

  // Period icon helper
  const getPeriodIcon = (period) => {
    switch (period) {
      case 'morning': return <Sun size={14} />;
      case 'afternoon': return <Sunset size={14} />;
      case 'evening': return <Moon size={14} />;
      default: return <Clock size={14} />;
    }
  };

  if (!trip) {
    return (
      <div className="trip-detail page-container">
        <div className="section" style={{ textAlign: 'center', paddingTop: '120px' }}>
          <AlertCircle size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '16px' }} />
          <h2>Trip not found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>This trip may have been deleted.</p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'itinerary', label: 'Itinerary', icon: <Calendar size={16} /> },
    { id: 'budget', label: 'Budget', icon: <Wallet size={16} /> },
    { id: 'suggestions', label: 'Suggestions', icon: <Star size={16} /> },
    { id: 'notes', label: 'Notes & Docs', icon: <FileText size={16} /> },
    { id: 'summary', label: 'Summary', icon: <Printer size={16} /> },
  ];

  return (
    <div className="trip-detail page-container">
      <div className="trip-detail-inner section">
        {/* Trip Header */}
        <div className="trip-header animate-fadeInUp">
          <button className="trip-back" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="trip-header-info">
            <h1 className="trip-header-title">
              <MapPin size={28} />
              {trip.destination}
            </h1>
            <div className="trip-header-meta">
              <span><Calendar size={14} /> {trip.numDays} Days</span>
              <span><Users size={14} /> {trip.travelers} Traveler{trip.travelers > 1 ? 's' : ''}</span>
              <span className="trip-header-budget" style={{ background: trip.budget === 'low' ? 'var(--pastel-mint)' : trip.budget === 'moderate' ? 'var(--pastel-blue)' : trip.budget === 'high' ? 'var(--pastel-peach)' : 'var(--pastel-purple)' }}>
                <Wallet size={14} /> {trip.budget || 'Flexible'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="trip-tabs animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`trip-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="trip-tab-content animate-fadeIn">

          {/* ===== ITINERARY TAB ===== */}
          {activeTab === 'itinerary' && (
            <div className="itinerary-tab">
              <div className="tab-header">
                <h2 className="tab-title">Day-by-Day Itinerary</h2>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Sparkles size={14} />}
                  onClick={handleRegenerate}
                  loading={aiLoading}
                >
                  Regenerate
                </Button>
              </div>

              {trip.itinerary?.days?.length > 0 ? (
                <div className="itinerary-days">
                  {trip.itinerary.days.map((day, dayIndex) => (
                    <div key={day.day} className="itinerary-day">
                      <button
                        className="itinerary-day-header"
                        onClick={() => toggleDay(day.day)}
                      >
                        <div className="itinerary-day-info">
                          <span className="itinerary-day-num">Day {day.day}</span>
                          <h3>{day.title}</h3>
                        </div>
                        <div className="itinerary-day-toggle">
                          <span className="itinerary-day-count">{day.activities?.length || 0} activities</span>
                          {expandedDays[day.day] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </button>

                      {(expandedDays[day.day] !== false) && (
                        <div className="itinerary-day-activities">
                          {day.activities?.map((activity, actIndex) => (
                            <div key={activity.id || actIndex} className="activity-item">
                              <div className="activity-time">
                                {getPeriodIcon(activity.period)}
                                <span>{activity.time}</span>
                              </div>
                              <div className="activity-content">
                                <h4>{activity.title}</h4>
                                <p>{activity.description}</p>
                                {activity.location && (
                                  <span className="activity-location">
                                    <MapPin size={12} /> {activity.location}
                                  </span>
                                )}
                              </div>
                              <div className="activity-meta">
                                {activity.estimatedCost > 0 && (
                                  <span className="activity-cost">${activity.estimatedCost}</span>
                                )}
                                {activity.duration && (
                                  <span className="activity-duration">
                                    <Clock size={12} /> {activity.duration}
                                  </span>
                                )}
                              </div>
                              <button
                                className="activity-delete"
                                onClick={() => removeActivity(dayIndex, actIndex)}
                                aria-label="Remove activity"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}

                          {/* Add Activity */}
                          {showAddActivity === dayIndex ? (
                            <div className="add-activity-form">
                              <div className="add-activity-row">
                                <input
                                  type="time"
                                  value={newActivity.time}
                                  onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                                  className="add-activity-input"
                                  placeholder="Time"
                                />
                                <select
                                  value={newActivity.period}
                                  onChange={(e) => setNewActivity({ ...newActivity, period: e.target.value })}
                                  className="add-activity-input"
                                >
                                  <option value="morning">Morning</option>
                                  <option value="afternoon">Afternoon</option>
                                  <option value="evening">Evening</option>
                                </select>
                              </div>
                              <input
                                type="text"
                                value={newActivity.title}
                                onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                                className="add-activity-input"
                                placeholder="Activity title"
                              />
                              <input
                                type="text"
                                value={newActivity.description}
                                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                                className="add-activity-input"
                                placeholder="Description (optional)"
                              />
                              <div className="add-activity-row">
                                <input
                                  type="number"
                                  value={newActivity.estimatedCost}
                                  onChange={(e) => setNewActivity({ ...newActivity, estimatedCost: e.target.value })}
                                  className="add-activity-input"
                                  placeholder="Cost ($)"
                                  min="0"
                                />
                                <div className="add-activity-actions">
                                  <Button variant="primary" size="sm" onClick={() => addActivity(dayIndex)}>Add</Button>
                                  <Button variant="ghost" size="sm" onClick={() => setShowAddActivity(null)}>Cancel</Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <button
                              className="add-activity-btn"
                              onClick={() => setShowAddActivity(dayIndex)}
                            >
                              <Plus size={16} /> Add Activity
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="tab-empty">
                  <p>No itinerary generated yet.</p>
                  <Button
                    variant="primary"
                    icon={<Sparkles size={16} />}
                    onClick={handleRegenerate}
                    loading={aiLoading}
                  >
                    Generate Itinerary
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ===== BUDGET TAB ===== */}
          {activeTab === 'budget' && (
            <div className="budget-tab">
              <div className="tab-header">
                <h2 className="tab-title">Expense Breakdown</h2>
              </div>

              {trip.expenses?.categories?.length > 0 ? (
                <>
                  {/* Visual bar chart */}
                  <div className="expense-chart">
                    <div className="expense-total-card">
                      <span className="expense-total-label">Total Estimated</span>
                      <span className="expense-total-amount">{trip.expenses.currency || '$'}{totalExpenses}</span>
                      <div className="expense-total-meta">
                        <span>~{trip.expenses.currency || '$'}{trip.expenses.perDay || Math.round(totalExpenses / (trip.numDays || 1))}/day</span>
                        <span>~{trip.expenses.currency || '$'}{trip.expenses.perPerson || Math.round(totalExpenses / (trip.travelers || 1))}/person</span>
                      </div>
                    </div>

                    <div className="expense-bars">
                      {trip.expenses.categories.map((cat, index) => (
                        <div key={cat.name} className="expense-bar-item">
                          <div className="expense-bar-header">
                            <div className="expense-bar-label">
                              <span className="expense-bar-dot" style={{ background: cat.color }}></span>
                              <span>{cat.name}</span>
                            </div>
                            <span className="expense-bar-pct">{cat.percentage}%</span>
                          </div>
                          <div className="expense-bar-track">
                            <div
                              className="expense-bar-fill"
                              style={{ width: `${cat.percentage}%`, background: cat.color }}
                            ></div>
                          </div>
                          <div className="expense-bar-amount">
                            <span>{trip.expenses.currency || '$'}</span>
                            <input
                              type="number"
                              value={cat.amount}
                              onChange={(e) => updateExpenseAmount(index, e.target.value)}
                              className="expense-amount-input"
                              min="0"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Saving Tips */}
                  {trip.expenses.savingTips?.length > 0 && (
                    <div className="expense-tips">
                      <h3>💡 Saving Tips</h3>
                      <ul>
                        {trip.expenses.savingTips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="tab-empty">
                  <p>No expense data available.</p>
                  <Button
                    variant="primary"
                    icon={<Sparkles size={16} />}
                    onClick={async () => {
                      const expenses = await generateExpenseBreakdown(trip.itinerary, trip.budget, trip.travelers);
                      if (expenses) updateTrip(id, { expenses });
                    }}
                    loading={aiLoading}
                  >
                    Generate Budget
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ===== SUGGESTIONS TAB ===== */}
          {activeTab === 'suggestions' && (
            <div className="suggestions-tab">
              <div className="tab-header">
                <h2 className="tab-title">AI Suggestions</h2>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Sparkles size={14} />}
                  onClick={async () => {
                    const [hotels, restaurants, places] = await Promise.all([
                      suggestHotels(trip.destination, trip.budget, (trip.numDays || 1) - 1),
                      suggestRestaurants(trip.destination, trip.budget, trip.allergies),
                      suggestPlaces(trip.destination, trip.numDays, trip.interests),
                    ]);
                    if (hotels) updateTrip(id, { hotels });
                    if (restaurants) updateTrip(id, { restaurants });
                    if (places) updateTrip(id, { places });
                  }}
                  loading={aiLoading}
                >
                  Refresh All
                </Button>
              </div>

              {/* Hotels */}
              <div className="suggestion-section">
                <h3 className="suggestion-section-title">
                  <Hotel size={20} /> Hotels & Accommodations
                </h3>
                {trip.hotels?.length > 0 ? (
                  <div className="suggestion-grid">
                    {trip.hotels.map((hotel) => (
                      <Card key={hotel.id} accent="pink" hoverable className="suggestion-card">
                        <div className="suggestion-card-header">
                          <h4>{hotel.name}</h4>
                          <span className="suggestion-rating">★ {hotel.rating}</span>
                        </div>
                        <p className="suggestion-type">{hotel.type}</p>
                        <p className="suggestion-desc">{hotel.description}</p>
                        <div className="suggestion-card-footer">
                          <span className="suggestion-price">${hotel.pricePerNight}/night</span>
                          <span className="suggestion-location"><MapPin size={12} /> {hotel.location}</span>
                        </div>
                        {hotel.amenities && (
                          <div className="suggestion-tags">
                            {hotel.amenities.slice(0, 4).map((a) => (
                              <span key={a} className="suggestion-tag">{a}</span>
                            ))}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="suggestion-empty">No hotel suggestions yet.</p>
                )}
              </div>

              {/* Restaurants */}
              <div className="suggestion-section">
                <h3 className="suggestion-section-title">
                  <UtensilsCrossed size={20} /> Restaurants & Dining
                </h3>
                {trip.restaurants?.length > 0 ? (
                  <div className="suggestion-grid">
                    {trip.restaurants.map((rest) => (
                      <Card key={rest.id} accent="blue" hoverable className="suggestion-card">
                        <div className="suggestion-card-header">
                          <h4>{rest.name}</h4>
                          <span className="suggestion-rating">★ {rest.rating}</span>
                        </div>
                        <p className="suggestion-type">{rest.cuisine} • {rest.priceRange}</p>
                        <p className="suggestion-desc">{rest.description}</p>
                        <div className="suggestion-card-footer">
                          <span className="suggestion-price">~${rest.avgMealCost}/meal</span>
                          <span className="suggestion-location"><MapPin size={12} /> {rest.location}</span>
                        </div>
                        {rest.dietaryOptions && (
                          <div className="suggestion-tags">
                            {rest.dietaryOptions.map((d) => (
                              <span key={d} className="suggestion-tag tag-green">{d}</span>
                            ))}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="suggestion-empty">No restaurant suggestions yet.</p>
                )}
              </div>

              {/* Places */}
              <div className="suggestion-section">
                <h3 className="suggestion-section-title">
                  <Landmark size={20} /> Places to Visit
                </h3>
                {trip.places?.length > 0 ? (
                  <div className="suggestion-grid">
                    {trip.places.map((place) => (
                      <Card key={place.id} accent="purple" hoverable className="suggestion-card">
                        <div className="suggestion-card-header">
                          <h4>{place.name}</h4>
                          <span className="suggestion-rating">★ {place.rating}</span>
                        </div>
                        <p className="suggestion-type">{place.type}</p>
                        <p className="suggestion-desc">{place.description}</p>
                        <div className="suggestion-card-footer">
                          <span className="suggestion-price">
                            {place.entryFee > 0 ? `$${place.entryFee} entry` : 'Free entry'}
                          </span>
                          <span className="suggestion-duration">
                            <Clock size={12} /> {place.estimatedTime}
                          </span>
                        </div>
                        {place.tips && (
                          <p className="suggestion-tip">💡 {place.tips}</p>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="suggestion-empty">No place suggestions yet.</p>
                )}
              </div>

              {aiLoading && <Loader fullPage text="Fetching AI suggestions..." />}
            </div>
          )}

          {/* ===== NOTES & DOCS TAB ===== */}
          {activeTab === 'notes' && (
            <div className="notes-tab">
              <div className="tab-header">
                <h2 className="tab-title">Notes & Documents</h2>
              </div>

              {/* Preferences Recap */}
              {(trip.allergies || trip.interests || trip.preferences) && (
                <div className="notes-prefs">
                  <h3>Your Preferences</h3>
                  {trip.allergies && (
                    <div className="notes-pref-item">
                      <strong>Allergies & Dietary:</strong> {trip.allergies}
                    </div>
                  )}
                  {trip.interests && (
                    <div className="notes-pref-item">
                      <strong>Interests:</strong> {trip.interests}
                    </div>
                  )}
                  {trip.preferences && (
                    <div className="notes-pref-item">
                      <strong>Additional Notes:</strong> {trip.preferences}
                    </div>
                  )}
                </div>
              )}

              {/* Editable Notes */}
              <div className="notes-editor">
                <h3>Trip Notes</h3>
                <textarea
                  className="notes-textarea"
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Write your notes here... packing list, reminders, emergency contacts, etc."
                  rows={8}
                />
                <p className="notes-autosave">Auto-saved</p>
              </div>

              {/* Document Upload */}
              <div className="notes-documents">
                <div className="notes-docs-header">
                  <h3>Documents</h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Upload size={14} />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                  />
                </div>

                {trip.documents?.length > 0 ? (
                  <div className="docs-list">
                    {trip.documents.map((doc) => (
                      <div key={doc.id} className="doc-item">
                        <div className="doc-info">
                          <FileText size={18} />
                          <div>
                            <span className="doc-name">{doc.name}</span>
                            <span className="doc-meta">
                              {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="doc-actions">
                          <button className="doc-action" onClick={() => downloadDocument(doc)} title="Download">
                            <Download size={16} />
                          </button>
                          <button className="doc-action doc-action-delete" onClick={() => removeDocument(doc.id)} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="suggestion-empty">No documents uploaded yet. Upload tickets, booking confirmations, or travel documents.</p>
                )}
              </div>
            </div>
          )}

          {/* ===== SUMMARY TAB ===== */}
          {activeTab === 'summary' && (
            <div className="summary-tab">
              <div className="tab-header">
                <h2 className="tab-title">Trip Summary</h2>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Printer size={14} />}
                  onClick={() => window.print()}
                >
                  Print
                </Button>
              </div>

              <div className="summary-content" id="trip-summary">
                <div className="summary-hero">
                  <h2>🌍 {trip.destination}</h2>
                  <p>{trip.itinerary?.summary || `A ${trip.numDays}-day adventure awaits!`}</p>
                </div>

                <div className="summary-grid">
                  <div className="summary-stat">
                    <Calendar size={20} />
                    <div>
                      <span className="summary-stat-label">Duration</span>
                      <strong>{trip.numDays} Days</strong>
                      <span className="summary-stat-sub">
                        {trip.startDate && new Date(trip.startDate).toLocaleDateString()} — {trip.endDate && new Date(trip.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="summary-stat">
                    <Users size={20} />
                    <div>
                      <span className="summary-stat-label">Travelers</span>
                      <strong>{trip.travelers}</strong>
                    </div>
                  </div>
                  <div className="summary-stat">
                    <Wallet size={20} />
                    <div>
                      <span className="summary-stat-label">Budget</span>
                      <strong className="capitalize">{trip.budget}</strong>
                    </div>
                  </div>
                  <div className="summary-stat">
                    <DollarSign size={20} />
                    <div>
                      <span className="summary-stat-label">Estimated Cost</span>
                      <strong>{trip.expenses?.currency || '$'}{totalExpenses}</strong>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                {trip.itinerary?.days?.length > 0 && (
                  <div className="summary-section">
                    <h3>📅 Itinerary Timeline</h3>
                    {trip.itinerary.days.map((day) => (
                      <div key={day.day} className="summary-day">
                        <h4>Day {day.day}: {day.title}</h4>
                        <div className="summary-activities">
                          {day.activities?.map((act, i) => (
                            <div key={i} className="summary-activity">
                              <span className="summary-act-time">{act.time}</span>
                              <span className="summary-act-title">{act.title}</span>
                              {act.estimatedCost > 0 && <span className="summary-act-cost">${act.estimatedCost}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Expense Summary */}
                {trip.expenses?.categories?.length > 0 && (
                  <div className="summary-section">
                    <h3>💰 Expense Breakdown</h3>
                    <div className="summary-expenses">
                      {trip.expenses.categories.map((cat) => (
                        <div key={cat.name} className="summary-expense-row">
                          <span className="summary-expense-dot" style={{ background: cat.color }}></span>
                          <span className="summary-expense-name">{cat.name}</span>
                          <span className="summary-expense-amount">{trip.expenses.currency || '$'}{cat.amount}</span>
                          <span className="summary-expense-pct">{cat.percentage}%</span>
                        </div>
                      ))}
                      <div className="summary-expense-row summary-expense-total">
                        <span></span>
                        <span><strong>Total</strong></span>
                        <span><strong>{trip.expenses.currency || '$'}{totalExpenses}</strong></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences */}
                {(trip.allergies || trip.interests || trip.preferences) && (
                  <div className="summary-section">
                    <h3>📝 Preferences & Notes</h3>
                    {trip.allergies && <p><strong>Allergies:</strong> {trip.allergies}</p>}
                    {trip.interests && <p><strong>Interests:</strong> {trip.interests}</p>}
                    {trip.preferences && <p><strong>Other Notes:</strong> {trip.preferences}</p>}
                    {trip.notes && <p><strong>Trip Notes:</strong> {trip.notes}</p>}
                  </div>
                )}

                {/* Tips */}
                {trip.itinerary?.tips?.length > 0 && (
                  <div className="summary-section">
                    <h3>💡 Travel Tips</h3>
                    <ul className="summary-tips">
                      {trip.itinerary.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripDetailPage;
