import { Booking, BookingStatus } from './booking.entity';
import { ValidationException, BookingConflictException } from '../../../common/exceptions/domain.exception';

describe('Booking Entity', () => {
  const validBookingData = {
    courtId: 'court-123',
    userId: 'user-456',
    startTime: new Date('2024-01-15T14:00:00Z'),
    endTime: new Date('2024-01-15T15:30:00Z'),
    price: 150,
  };

  describe('create', () => {
    it('should create a valid booking', () => {
      const booking = Booking.create(validBookingData);

      expect(booking).toBeDefined();
      expect(booking.courtId).toBe(validBookingData.courtId);
      expect(booking.userId).toBe(validBookingData.userId);
      expect(booking.status).toBe(BookingStatus.PENDING);
    });

    it('should throw error if court ID is missing', () => {
      const invalidData = { ...validBookingData, courtId: '' };

      expect(() => Booking.create(invalidData)).toThrow(ValidationException);
    });

    it('should throw error if user ID is missing', () => {
      const invalidData = { ...validBookingData, userId: '' };

      expect(() => Booking.create(invalidData)).toThrow(ValidationException);
    });

    it('should throw error if end time is before start time', () => {
      const invalidData = {
        ...validBookingData,
        startTime: new Date('2024-01-15T15:00:00Z'),
        endTime: new Date('2024-01-15T14:00:00Z'),
      };

      expect(() => Booking.create(invalidData)).toThrow(ValidationException);
    });

    it('should throw error if duration is less than 60 minutes', () => {
      const invalidData = {
        ...validBookingData,
        startTime: new Date('2024-01-15T14:00:00Z'),
        endTime: new Date('2024-01-15T14:30:00Z'), // Only 30 minutes
      };

      expect(() => Booking.create(invalidData)).toThrow(ValidationException);
    });

    it('should throw error if price is negative', () => {
      const invalidData = { ...validBookingData, price: -10 };

      expect(() => Booking.create(invalidData)).toThrow(ValidationException);
    });
  });

  describe('confirm', () => {
    it('should confirm a pending booking', () => {
      const booking = Booking.create(validBookingData);
      booking.confirm();

      expect(booking.status).toBe(BookingStatus.CONFIRMED);
    });

    it('should throw error if trying to confirm a cancelled booking', () => {
      const booking = Booking.create(validBookingData);
      booking.cancel();

      expect(() => booking.confirm()).toThrow(BookingConflictException);
    });
  });

  describe('cancel', () => {
    it('should cancel a pending booking', () => {
      const booking = Booking.create(validBookingData);
      booking.cancel();

      expect(booking.status).toBe(BookingStatus.CANCELLED);
    });

    it('should cancel a confirmed booking', () => {
      const booking = Booking.create(validBookingData);
      booking.confirm();
      booking.cancel();

      expect(booking.status).toBe(BookingStatus.CANCELLED);
    });

    it('should throw error if trying to cancel a completed booking', () => {
      const booking = Booking.create(validBookingData);
      booking.confirm();
      booking.complete();

      expect(() => booking.cancel()).toThrow(BookingConflictException);
    });

    it('should throw error if booking is already cancelled', () => {
      const booking = Booking.create(validBookingData);
      booking.cancel();

      expect(() => booking.cancel()).toThrow(BookingConflictException);
    });
  });

  describe('overlaps', () => {
    it('should detect overlapping bookings', () => {
      const booking1 = Booking.create({
        ...validBookingData,
        startTime: new Date('2024-01-15T14:00:00Z'),
        endTime: new Date('2024-01-15T15:30:00Z'),
      });

      const booking2 = Booking.create({
        ...validBookingData,
        startTime: new Date('2024-01-15T15:00:00Z'),
        endTime: new Date('2024-01-15T16:30:00Z'),
      });

      expect(booking1.overlaps(booking2)).toBe(true);
    });

    it('should not detect overlapping for sequential bookings', () => {
      const booking1 = Booking.create({
        ...validBookingData,
        startTime: new Date('2024-01-15T14:00:00Z'),
        endTime: new Date('2024-01-15T15:30:00Z'),
      });

      const booking2 = Booking.create({
        ...validBookingData,
        startTime: new Date('2024-01-15T15:30:00Z'),
        endTime: new Date('2024-01-15T17:00:00Z'),
      });

      expect(booking1.overlaps(booking2)).toBe(false);
    });

    it('should not detect overlapping for different courts', () => {
      const booking1 = Booking.create({
        ...validBookingData,
        courtId: 'court-1',
      });

      const booking2 = Booking.create({
        ...validBookingData,
        courtId: 'court-2',
      });

      expect(booking1.overlaps(booking2)).toBe(false);
    });
  });

  describe('getDurationMinutes', () => {
    it('should calculate duration correctly', () => {
      const booking = Booking.create({
        ...validBookingData,
        startTime: new Date('2024-01-15T14:00:00Z'),
        endTime: new Date('2024-01-15T15:30:00Z'),
      });

      expect(booking.getDurationMinutes()).toBe(90);
    });
  });

  describe('isActive', () => {
    it('should return true for pending bookings', () => {
      const booking = Booking.create(validBookingData);
      expect(booking.isActive()).toBe(true);
    });

    it('should return true for confirmed bookings', () => {
      const booking = Booking.create(validBookingData);
      booking.confirm();
      expect(booking.isActive()).toBe(true);
    });

    it('should return false for cancelled bookings', () => {
      const booking = Booking.create(validBookingData);
      booking.cancel();
      expect(booking.isActive()).toBe(false);
    });

    it('should return false for completed bookings', () => {
      const booking = Booking.create(validBookingData);
      booking.confirm();
      booking.complete();
      expect(booking.isActive()).toBe(false);
    });
  });
});
