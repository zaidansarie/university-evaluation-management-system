const University = require('../model/University');

class UniversityController {
  static async createUniversity(req, res) {
    try {
      const university = await University.create(req.body);
      res.status(201).json(university);
    } catch (error) {
      console.error('Error creating university:', error);
      res.status(500).json({ error: 'Failed to create university' });
    }
  }

  static async getUniversities(req, res) {
    try {
      const universities = await University.findAll();
      res.json(universities);
    } catch (error) {
      console.error('Error fetching universities:', error);
      res.status(500).json({ error: 'Failed to fetch universities' });
    }
  }

  static async getUniversityById(req, res) {
    try {
      const university = await University.findById(req.params.id);
      if (!university) {
        return res.status(404).json({ error: 'University not found' });
      }
      res.json(university);
    } catch (error) {
      console.error('Error fetching university:', error);
      res.status(500).json({ error: 'Failed to fetch university' });
    }
  }

  static async updateUniversity(req, res) {
    try {
      await University.update(req.params.id, req.body);
      res.json({ message: 'University updated successfully' });
    } catch (error) {
      console.error('Error updating university:', error);
      res.status(500).json({ error: 'Failed to update university' });
    }
  }

  static async deleteUniversity(req, res) {
    try {
      await University.delete(req.params.id);
      res.json({ message: 'University deleted successfully' });
    } catch (error) {
      console.error('Error deleting university:', error);
      res.status(500).json({ error: 'Failed to delete university' });
    }
  }
}

module.exports = UniversityController;
