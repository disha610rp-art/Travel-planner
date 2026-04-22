import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, Users, Wallet, FileText,
  ArrowRight, ArrowLeft, Sparkles, Check,
  DollarSign, TrendingUp, Crown, Infinity
} from 'lucide-react';
import useTrips from '../hooks/useTrips';
import useGroqAI from '../hooks/useGroqAI';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import './NewTripPage.css';

/**
 * NewTripPage — Multi-step trip creation wizard
 * Step 1: Destination & dates
 * Step 2: Budget selection
 * Step 3: Preferences & notes
 * Step 4: AI generation & review
 */
const NewTripPage = () => {
  const navigate = useNavigate();
  const { addTrip } = useTrips();
  const { generateFullTrip, loading: aiLoading, error: aiError } = useGroqAI();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    budget: '',
    preferences: '',
    allergies: '',
    interests: '',
  });
  const [errors, setErrors] = useState({});
  const [generatedData, setGeneratedData] = useState(null);

  // Calculate number of days
  const numDays = useMemo(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return diff > 0 ? diff : 0;
    }
    return 0;
  }, [formData.startDate, formData.endDate]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const setBudget = useCallback((budget) => {
    setFormData((prev) => ({ ...prev, budget }));
    if (errors.budget) {
      setErrors((prev) => ({ ...prev, budget: '' }));
    }
  }, [errors]);

  // Step validation
  const validateStep = useCallback((currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.destination.trim()) newErrors.destination = 'Destination is required';
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';
      if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
      if (formData.travelers < 1) newErrors.travelers = 'At least 1 traveler required';
    }

    if (currentStep === 2) {
      if (!formData.budget) newErrors.budget = 'Please select a budget';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const nextStep = useCallback(() => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  }, [step, validateStep]);

  const prevStep = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 1));
  }, []);

  // Generate AI content (Step 4)
  const handleGenerate = useCallback(async () => {
    if (!validateStep(3)) return;

    const prefs = [formData.preferences, formData.allergies, formData.interests]
      .filter(Boolean)
      .join('. ');

    // Run single consolidated AI call
    const fullTrip = await generateFullTrip({
      destination: formData.destination,
      days: numDays,
      budget: formData.budget,
      travelers: formData.travelers,
      preferences: prefs,
      allergies: formData.allergies,
      interests: formData.interests,
    });

    if (fullTrip) {
      setGeneratedData({
        itinerary: fullTrip.itinerary || null,
        hotels: fullTrip.hotels || [],
        restaurants: fullTrip.restaurants || [],
        places: fullTrip.places || [],
        expenses: fullTrip.expenses || null,
      });
      setStep(4);
    }
  }, [formData, numDays, validateStep, generateFullTrip]);

  // Save trip
  const handleSave = useCallback(() => {
    const trip = addTrip({
      destination: formData.destination,
      startDate: formData.startDate,
      endDate: formData.endDate,
      travelers: formData.travelers,
      budget: formData.budget,
      preferences: formData.preferences,
      allergies: formData.allergies,
      interests: formData.interests,
      numDays,
      itinerary: generatedData?.itinerary || null,
      hotels: generatedData?.hotels || [],
      restaurants: generatedData?.restaurants || [],
      places: generatedData?.places || [],
      expenses: generatedData?.expenses || null,
      notes: '',
      documents: [],
    });

    navigate(`/trip/${trip.id}`);
  }, [formData, numDays, generatedData, addTrip, navigate]);

  const budgetOptions = [
    { value: 'low', label: 'Budget', icon: <DollarSign size={24} />, description: 'Affordable options, hostels, street food', color: 'var(--pastel-mint)' },
    { value: 'moderate', label: 'Moderate', icon: <TrendingUp size={24} />, description: 'Mid-range hotels, nice restaurants', color: 'var(--pastel-blue)' },
    { value: 'high', label: 'Premium', icon: <Crown size={24} />, description: 'Luxury stays, fine dining, VIP experiences', color: 'var(--pastel-peach)' },
    { value: 'flexible', label: 'No Fixed', icon: <Infinity size={24} />, description: 'Show me everything, I\'ll decide', color: 'var(--pastel-purple)' },
  ];

  const stepLabels = ['Details', 'Budget', 'Preferences', 'Review'];

  return (
    <div className="new-trip page-container">
      <div className="new-trip-inner section">
        {/* Progress Steps */}
        <div className="step-progress animate-fadeInDown">
          {stepLabels.map((label, index) => (
            <div
              key={label}
              className={`step-item ${step > index + 1 ? 'completed' : ''} ${step === index + 1 ? 'active' : ''}`}
            >
              <div className="step-circle">
                {step > index + 1 ? <Check size={14} /> : index + 1}
              </div>
              <span className="step-label">{label}</span>
              {index < stepLabels.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        {/* Step 1: Trip Details */}
        {step === 1 && (
          <div className="step-content animate-fadeInUp">
            <div className="step-header">
              <h2 className="step-title">
                Where are you <span className="text-gradient">heading</span>?
              </h2>
              <p className="step-subtitle">Let's start with the basics of your trip.</p>
            </div>

            <div className="step-form">
              <Input
                label="Destination"
                name="destination"
                placeholder="e.g., Paris, France"
                value={formData.destination}
                onChange={handleChange}
                error={errors.destination}
                icon={<MapPin size={18} />}
              />

              <div className="form-row">
                <Input
                  label="Start Date"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  error={errors.startDate}
                  icon={<Calendar size={18} />}
                />
                <Input
                  label="End Date"
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  error={errors.endDate}
                  icon={<Calendar size={18} />}
                />
              </div>

              {numDays > 0 && (
                <div className="days-badge animate-scaleIn">
                  <Calendar size={16} />
                  {numDays} {numDays === 1 ? 'day' : 'days'} trip
                </div>
              )}

              <Input
                label="Number of Travelers"
                type="number"
                name="travelers"
                min="1"
                max="20"
                value={formData.travelers}
                onChange={handleChange}
                error={errors.travelers}
                icon={<Users size={18} />}
              />
            </div>

            <div className="step-actions">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button variant="primary" size="lg" icon={<ArrowRight size={18} />} onClick={nextStep}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Budget */}
        {step === 2 && (
          <div className="step-content animate-fadeInUp">
            <div className="step-header">
              <h2 className="step-title">
                What's your <span className="text-gradient">budget</span>?
              </h2>
              <p className="step-subtitle">This helps us find the perfect options for you.</p>
            </div>

            <div className="budget-grid">
              {budgetOptions.map((option) => (
                <Card
                  key={option.value}
                  hoverable
                  onClick={() => setBudget(option.value)}
                  className={`budget-card ${formData.budget === option.value ? 'budget-selected' : ''}`}
                >
                  <div className="budget-icon" style={{ background: option.color }}>
                    {option.icon}
                  </div>
                  <h3 className="budget-label">{option.label}</h3>
                  <p className="budget-description">{option.description}</p>
                  {formData.budget === option.value && (
                    <div className="budget-check animate-scaleIn">
                      <Check size={16} />
                    </div>
                  )}
                </Card>
              ))}
            </div>
            {errors.budget && <p className="budget-error">{errors.budget}</p>}

            <div className="step-actions">
              <Button variant="ghost" icon={<ArrowLeft size={18} />} onClick={prevStep}>
                Back
              </Button>
              <Button variant="primary" size="lg" icon={<ArrowRight size={18} />} onClick={nextStep}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preferences */}
        {step === 3 && (
          <div className="step-content animate-fadeInUp">
            <div className="step-header">
              <h2 className="step-title">
                Tell us your <span className="text-gradient">preferences</span>
              </h2>
              <p className="step-subtitle">Help us personalize your trip experience.</p>
            </div>

            <div className="step-form">
              <Input
                label="Allergies & Dietary Restrictions"
                type="textarea"
                name="allergies"
                placeholder="e.g., Nut allergy, vegetarian, gluten-free, lactose intolerant..."
                value={formData.allergies}
                onChange={handleChange}
                icon={<FileText size={18} />}
              />

              <Input
                label="Interests & Activities"
                type="textarea"
                name="interests"
                placeholder="e.g., Historical sites, adventure sports, local cuisine, photography, nightlife..."
                value={formData.interests}
                onChange={handleChange}
              />

              <Input
                label="Additional Notes"
                type="textarea"
                name="preferences"
                placeholder="e.g., Traveling with kids, wheelchair accessible, early morning flights preferred..."
                value={formData.preferences}
                onChange={handleChange}
              />
            </div>

            <div className="step-actions">
              <Button variant="ghost" icon={<ArrowLeft size={18} />} onClick={prevStep}>
                Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                icon={<Sparkles size={18} />}
                onClick={handleGenerate}
                loading={aiLoading}
              >
                {aiLoading ? 'Generating with AI...' : 'Generate Itinerary'}
              </Button>
            </div>

            {aiLoading && (
              <div className="ai-loading animate-fadeIn">
                <Loader size="lg" text="AI is crafting your perfect itinerary..." />
                <p className="ai-loading-sub">This may take 15-30 seconds</p>
              </div>
            )}

            {aiError && (
              <div className="ai-error animate-fadeIn">
                <p>⚠️ {aiError}</p>
                <Button variant="secondary" size="sm" onClick={handleGenerate}>
                  Try Again
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review & Save */}
        {step === 4 && generatedData && (
          <div className="step-content animate-fadeInUp">
            <div className="step-header">
              <h2 className="step-title">
                Your <span className="text-gradient">itinerary</span> is ready! 🎉
              </h2>
              <p className="step-subtitle">
                {generatedData.itinerary?.summary || 'Review your AI-generated travel plan below.'}
              </p>
            </div>

            {/* Summary Cards */}
            <div className="review-summary">
              <Card accent="pink" className="review-card">
                <MapPin size={20} />
                <div>
                  <span className="review-label">Destination</span>
                  <strong>{formData.destination}</strong>
                </div>
              </Card>
              <Card accent="blue" className="review-card">
                <Calendar size={20} />
                <div>
                  <span className="review-label">Duration</span>
                  <strong>{numDays} Days</strong>
                </div>
              </Card>
              <Card accent="purple" className="review-card">
                <Wallet size={20} />
                <div>
                  <span className="review-label">Budget</span>
                  <strong className="capitalize">{formData.budget}</strong>
                </div>
              </Card>
              <Card accent="mint" className="review-card">
                <Users size={20} />
                <div>
                  <span className="review-label">Travelers</span>
                  <strong>{formData.travelers}</strong>
                </div>
              </Card>
            </div>

            {/* Preview */}
            <div className="review-preview">
              <h3>📅 Itinerary Preview</h3>
              {generatedData.itinerary?.days?.slice(0, 2).map((day) => (
                <div key={day.day} className="review-day">
                  <h4>Day {day.day}: {day.title}</h4>
                  <ul>
                    {day.activities?.slice(0, 3).map((act, i) => (
                      <li key={i}>{act.time} — {act.title}</li>
                    ))}
                    {day.activities?.length > 3 && (
                      <li className="review-more">+{day.activities.length - 3} more activities</li>
                    )}
                  </ul>
                </div>
              ))}
              {generatedData.itinerary?.days?.length > 2 && (
                <p className="review-more">
                  +{generatedData.itinerary.days.length - 2} more days — view full details after saving
                </p>
              )}
            </div>

            {/* Expense Preview */}
            {generatedData.expenses && (
              <div className="review-preview">
                <h3>💰 Estimated Budget: {generatedData.expenses.currency || '$'}{generatedData.expenses.totalEstimated}</h3>
                <p className="review-expense-note">
                  ~{generatedData.expenses.currency || '$'}{generatedData.expenses.perDay}/day per person
                </p>
              </div>
            )}

            <div className="step-actions">
              <Button variant="ghost" icon={<ArrowLeft size={18} />} onClick={() => setStep(3)}>
                Back
              </Button>
              <Button variant="primary" size="lg" icon={<Check size={18} />} onClick={handleSave}>
                Save Trip
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewTripPage;
