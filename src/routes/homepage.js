import { Router } from 'express';
import { HomePage } from '../models/HomePage.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get homepage content
router.get('/', async (req, res) => {
  try {
    let homepage = await HomePage.findOne({});
    
    // If no homepage exists, create a default one with the schema defaults
    if (!homepage) {
      homepage = new HomePage({
        heroTitle: 'Welcome to Our Homeopathy Clinic',
        heroSubtitle: 'Natural Healing for Your Wellbeing',
        aboutTitle: 'About Our Clinic',
        aboutContent: 'We provide holistic homeopathic treatments for various health conditions.',
        services: [
          {
            title: 'Personalized Treatment',
            description: 'Customized homeopathic solutions tailored to your specific health needs and symptoms.',
            icon: 'fas fa-user-md'
          },
          {
            title: 'Holistic Care',
            description: 'Addressing the root cause of illness for complete and lasting healing.',
            icon: 'fas fa-heart'
          },
          {
            title: 'Natural Remedies',
            description: 'Safe and effective treatments using natural substances in highly diluted forms.',
            icon: 'fas fa-leaf'
          }
        ]
      });
      await homepage.save();
    } else if (!homepage.services || homepage.services.length === 0) {
      // Ensure services array has 3 items
      homepage.services = [
        {
          title: 'Personalized Treatment',
          description: 'Customized homeopathic solutions tailored to your specific health needs and symptoms.',
          icon: 'fas fa-user-md'
        },
        {
          title: 'Holistic Care',
          description: 'Addressing the root cause of illness for complete and lasting healing.',
          icon: 'fas fa-heart'
        },
        {
          title: 'Natural Remedies',
          description: 'Safe and effective treatments using natural substances in highly diluted forms.',
          icon: 'fas fa-leaf'
        }
      ];
      await homepage.save();
    }
    
    res.json({
      success: true,
      data: homepage
    });
  } catch (error) {
    console.error('Error fetching homepage:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching homepage content'
    });
  }
});

// Update homepage content (admin only)
router.put('/', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    
    let homepage = await HomePage.findOne({});
    
    if (!homepage) {
      homepage = new HomePage(updates);
    } else {
      Object.assign(homepage, updates);
      // Only set updatedBy if user exists
      if (req.user && req.user.id) {
        homepage.updatedBy = req.user.id;
      }
    }
    
    await homepage.save();
    
    res.json({
      success: true,
      message: 'Homepage updated successfully',
      data: homepage
    });
  } catch (error) {
    console.error('Error updating homepage:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating homepage content'
    });
  }
});

export default router;
