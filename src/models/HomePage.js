import mongoose from 'mongoose';

const homePageSchema = new mongoose.Schema({
  heroTitle: {
    type: String,
    required: true,
    default: 'Welcome to Our Homeopathy Clinic'
  },
  heroSubtitle: {
    type: String,
    default: 'Natural Healing for Your Wellbeing'
  },
  heroImage: {
    type: String,
    default: ''
  },
  aboutTitle: {
    type: String,
    default: 'About Our Clinic'
  },
  aboutContent: {
    type: String,
    default: 'We provide holistic homeopathic treatments for various health conditions.'
  },
  aboutImage: {
    type: String,
    default: ''
  },
  services: {
    type: [{
      title: String,
      description: String,
      icon: String
    }],
    default: [
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
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  }
}, { timestamps: true });

// Create the model if it doesn't exist
export const HomePage = mongoose.models.HomePage || mongoose.model('HomePage', homePageSchema);
