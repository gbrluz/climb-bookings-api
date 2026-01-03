import { Club } from './club.entity';
import { ValidationException } from '../../../common/exceptions/domain.exception';

describe('Club Entity', () => {
  const validClubData = {
    ownerId: 'owner-123',
    name: 'Padel Club São Paulo',
    city: 'São Paulo',
    state: 'SP',
    address: 'Rua das Flores, 123',
    phone: '+5511999999999',
    latitude: -23.5505,
    longitude: -46.6333,
  };

  describe('create', () => {
    it('should create a valid club', () => {
      const club = Club.create(validClubData);

      expect(club).toBeDefined();
      expect(club.ownerId).toBe(validClubData.ownerId);
      expect(club.name).toBe(validClubData.name);
      expect(club.city).toBe(validClubData.city);
    });

    it('should throw error if name is missing', () => {
      const invalidData = { ...validClubData, name: '' };

      expect(() => Club.create(invalidData)).toThrow(ValidationException);
    });

    it('should throw error if city is missing', () => {
      const invalidData = { ...validClubData, city: '' };

      expect(() => Club.create(invalidData)).toThrow(ValidationException);
    });

    it('should throw error if state is missing', () => {
      const invalidData = { ...validClubData, state: '' };

      expect(() => Club.create(invalidData)).toThrow(ValidationException);
    });

    it('should throw error if owner ID is missing', () => {
      const invalidData = { ...validClubData, ownerId: '' };

      expect(() => Club.create(invalidData)).toThrow(ValidationException);
    });

    it('should throw error if latitude is invalid', () => {
      const invalidData = { ...validClubData, latitude: 100 };

      expect(() => Club.create(invalidData)).toThrow(ValidationException);
    });

    it('should throw error if longitude is invalid', () => {
      const invalidData = { ...validClubData, longitude: 200 };

      expect(() => Club.create(invalidData)).toThrow(ValidationException);
    });
  });

  describe('updateName', () => {
    it('should update club name', () => {
      const club = Club.create(validClubData);
      club.updateName('New Club Name');

      expect(club.name).toBe('New Club Name');
    });

    it('should throw error if name is empty', () => {
      const club = Club.create(validClubData);

      expect(() => club.updateName('')).toThrow(ValidationException);
    });
  });

  describe('updateLocation', () => {
    it('should update location', () => {
      const club = Club.create(validClubData);
      club.updateLocation('Rio de Janeiro', 'RJ', 'Rua Nova, 456');

      expect(club.city).toBe('Rio de Janeiro');
      expect(club.state).toBe('RJ');
      expect(club.address).toBe('Rua Nova, 456');
    });

    it('should throw error if city is empty', () => {
      const club = Club.create(validClubData);

      expect(() => club.updateLocation('', 'RJ')).toThrow(ValidationException);
    });
  });

  describe('updateCoordinates', () => {
    it('should update coordinates', () => {
      const club = Club.create(validClubData);
      club.updateCoordinates(-22.9068, -43.1729);

      expect(club.latitude).toBe(-22.9068);
      expect(club.longitude).toBe(-43.1729);
    });

    it('should throw error for invalid latitude', () => {
      const club = Club.create(validClubData);

      expect(() => club.updateCoordinates(100, -43.1729)).toThrow(ValidationException);
    });

    it('should throw error for invalid longitude', () => {
      const club = Club.create(validClubData);

      expect(() => club.updateCoordinates(-22.9068, 200)).toThrow(ValidationException);
    });
  });

  describe('addImage', () => {
    it('should add image to club', () => {
      const club = Club.create(validClubData);
      club.addImage('https://example.com/image1.jpg');

      expect(club.images).toContain('https://example.com/image1.jpg');
    });
  });

  describe('removeImage', () => {
    it('should remove image from club', () => {
      const club = Club.create({
        ...validClubData,
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      });

      club.removeImage('https://example.com/image1.jpg');

      expect(club.images).not.toContain('https://example.com/image1.jpg');
      expect(club.images).toContain('https://example.com/image2.jpg');
    });
  });

  describe('isOwnedBy', () => {
    it('should return true for owner', () => {
      const club = Club.create(validClubData);

      expect(club.isOwnedBy('owner-123')).toBe(true);
    });

    it('should return false for non-owner', () => {
      const club = Club.create(validClubData);

      expect(club.isOwnedBy('other-user-456')).toBe(false);
    });
  });

  describe('hasLocation', () => {
    it('should return true when coordinates are set', () => {
      const club = Club.create(validClubData);

      expect(club.hasLocation()).toBe(true);
    });

    it('should return false when coordinates are not set', () => {
      const club = Club.create({
        ...validClubData,
        latitude: undefined,
        longitude: undefined,
      });

      expect(club.hasLocation()).toBe(false);
    });
  });
});
