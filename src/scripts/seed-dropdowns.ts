import mongoose from 'mongoose';
import config from '../config';
import Dropdown from '../models/dropdown.model';

async function seed() {
  await mongoose.connect(config.mongoUri);
  const items = [
    { category: 'SECTOR', code: 'BANKING', label: 'Banking & Finance', sortOrder: 1 },
    { category: 'SECTOR', code: 'GOV', label: 'Government', sortOrder: 2 },
    { category: 'SECTOR', code: 'ICT', label: 'ICT & Telecom', sortOrder: 3 },

    { category: 'EMPLOYEE_SIZE', code: 'SMALL', label: '1-49', sortOrder: 1 },
    { category: 'EMPLOYEE_SIZE', code: 'MEDIUM', label: '50-249', sortOrder: 2 },
    { category: 'EMPLOYEE_SIZE', code: 'LARGE', label: '250+', sortOrder: 3 },

    { category: 'PROFESSIONAL_TYPE', code: 'LOCAL', label: 'Local', sortOrder: 1 },
    { category: 'PROFESSIONAL_TYPE', code: 'FOREIGN', label: 'Foreign', sortOrder: 2 },

    { category: 'ID_TYPE', code: 'NATIONAL_ID', label: 'National ID', sortOrder: 1 },
    { category: 'ID_TYPE', code: 'PASSPORT', label: 'Passport', sortOrder: 2 },

    { category: 'DESIGNATION', code: 'CISO', label: 'Chief Information Security Officer', sortOrder: 1 },
    { category: 'DESIGNATION', code: 'SEC_ENG', label: 'Security Engineer', sortOrder: 2 },

    { category: 'SERVICE_TYPE', code: 'CONSULTING', label: 'Consulting', sortOrder: 1 },
    { category: 'SERVICE_TYPE', code: 'PENTEST', label: 'Penetration Testing', sortOrder: 2 }
  ];

  for (const it of items) {
    await Dropdown.updateOne({ category: it.category, code: it.code }, it, { upsert: true });
  }
  // eslint-disable-next-line no-console
  console.log('Seeded dropdowns');
  await mongoose.disconnect();
}

seed().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
