import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MapPin, Calendar, Wallet, Trash2, ChevronRight, Plane } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useTrips from '../hooks/useTrips';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import './DashboardPage.css';

/**
 * DashboardPage — Shows all trips with search, floating new trip button
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const { trips, deleteTrip } = useTrips();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, tripId: null, name: '' });

  // Filter trips by search query — uses useMemo for optimization
  const filteredTrips = useMemo(() => {
    if (!search.trim()) return trips;
    const query = search.toLowerCase();
    return trips.filter(
      (trip) =>
        trip.destination?.toLowerCase().includes(query) ||
        trip.budget?.toLowerCase().includes(query)
    );
  }, [trips, search]);

  const handleDeleteClick = useCallback((e, trip) => {
    e.stopPropagation();
    setDeleteModal({ open: true, tripId: trip.id, name: trip.destination });
  }, []);

  const confirmDelete = useCallback(() => {
    deleteTrip(deleteModal.tripId);
    setDeleteModal({ open: false, tripId: null, name: '' });
  }, [deleteModal.tripId, deleteTrip]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getBudgetColor = (budget) => {
    switch (budget) {
      case 'low': return 'var(--pastel-mint)';
      case 'moderate': return 'var(--pastel-blue)';
      case 'high': return 'var(--pastel-peach)';
      default: return 'var(--pastel-purple)';
    }
  };

  const accentColors = ['pink', 'blue', 'purple', 'mint', 'peach'];

  return (
    <div className="dashboard page-container">
      <div className="dashboard-inner section">
        {/* Header */}
        <div className="dashboard-header animate-fadeInUp">
          <div>
            <h1 className="dashboard-title">
              Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>! 👋
            </h1>
            <p className="dashboard-subtitle">
              {trips.length > 0
                ? `You have ${trips.length} trip${trips.length > 1 ? 's' : ''} planned. Let's make them perfect.`
                : 'Ready to plan your next adventure? Create your first trip!'}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        {trips.length > 0 && (
          <div className="dashboard-search animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <Search size={18} className="dashboard-search-icon" />
            <input
              type="text"
              placeholder="Search trips by destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="dashboard-search-input"
            />
          </div>
        )}

        {/* Trip Grid */}
        {filteredTrips.length > 0 ? (
          <div className="dashboard-grid">
            {filteredTrips.map((trip, index) => (
              <Card
                key={trip.id}
                accent={accentColors[index % accentColors.length]}
                hoverable
                onClick={() => navigate(`/trip/${trip.id}`)}
                className="trip-card animate-fadeInUp"
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                <div className="trip-card-header">
                  <div className="trip-card-destination">
                    <MapPin size={18} />
                    <h3>{trip.destination}</h3>
                  </div>
                  <button
                    className="trip-card-delete"
                    onClick={(e) => handleDeleteClick(e, trip)}
                    aria-label="Delete trip"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="trip-card-details">
                  {trip.startDate && (
                    <div className="trip-card-detail">
                      <Calendar size={14} />
                      <span>{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</span>
                    </div>
                  )}
                  <div className="trip-card-detail">
                    <Wallet size={14} />
                    <span
                      className="trip-card-budget"
                      style={{ background: getBudgetColor(trip.budget) }}
                    >
                      {trip.budget || 'Flexible'} budget
                    </span>
                  </div>
                </div>

                <div className="trip-card-footer">
                  <span className="trip-card-date">Created {formatDate(trip.createdAt)}</span>
                  <ChevronRight size={18} className="trip-card-arrow" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty animate-fadeInUp">
            <div className="dashboard-empty-icon">
              <Plane size={48} />
            </div>
            <h2 className="dashboard-empty-title">No trips yet</h2>
            <p className="dashboard-empty-text">
              {search
                ? 'No trips match your search. Try a different query.'
                : 'Start planning your first adventure by clicking the + button below!'}
            </p>
            {!search && (
              <Button
                variant="primary"
                size="lg"
                icon={<Plus size={20} />}
                onClick={() => navigate('/trip/new')}
              >
                Create Your First Trip
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        className="fab animate-scaleIn"
        onClick={() => navigate('/trip/new')}
        aria-label="Create new trip"
        title="Create new trip"
      >
        <Plus size={28} />
      </button>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, tripId: null, name: '' })}
        title="Delete Trip"
        size="sm"
      >
        <div className="delete-modal-content">
          <p>Are you sure you want to delete your trip to <strong>{deleteModal.name}</strong>?</p>
          <p className="delete-modal-warning">This action cannot be undone.</p>
          <div className="delete-modal-actions">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ open: false, tripId: null, name: '' })}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete Trip
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardPage;
