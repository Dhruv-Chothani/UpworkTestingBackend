import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin.js';
import { Slot } from '../models/Slot.js';
import { Blog } from '../models/Blog.js';
import { defaultSlots, defaultBlogs, defaultContent } from '../constants/defaults.js';
import { Content } from '../models/Content.js';

export const seedDefaults = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const existing = await Admin.findOne({ email: adminEmail });
    if (!existing) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await Admin.create({ email: adminEmail, passwordHash });
      console.log('Admin user created');
    }
  }

  const slotCount = await Slot.countDocuments();
  if (slotCount === 0) {
    await Slot.insertMany(defaultSlots);
    console.log('Seeded default slots');
  }

  const blogCount = await Blog.countDocuments();
  if (blogCount === 0) {
    await Blog.insertMany(
      defaultBlogs.map((b) => ({
        ...b,
        publishedAt: new Date(),
      }))
    );
    console.log('Seeded default blogs');
  }

  const hasContent = await Content.findOne({ key: 'home' });
  if (!hasContent) {
    await Content.create({ key: 'home', data: defaultContent });
    console.log('Seeded default home content');
  }
};

