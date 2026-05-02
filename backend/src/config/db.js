const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    if (!MONGO_URI) {
      console.error('❌ MONGO_URI not set in environment');
      return;
    }
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    // Attempt to ensure the ratings index is safe:
    // - drop any existing index named student_1_menu_1_mealType_1 (leftover from prior schema)
    // - create a new unique index that only indexes documents where student and menu fields exist
    try {
      const Rating = require('../models/Rating');
      if (Rating && Rating.collection) {
        const coll = Rating.collection;
        // Drop old index if present (ignore errors)
        try {
          const indexes = await coll.indexes();
          const hasOld = indexes.some(ix => ix.name === 'student_1_menu_1_mealType_1');
          if (hasOld) {
            await coll.dropIndex('student_1_menu_1_mealType_1');
            console.log('Dropped old ratings index student_1_menu_1_mealType_1');
          }
        } catch (dropErr) {
          console.warn('Could not drop old ratings index (continuing):', dropErr.message || dropErr);
        }

        // Create a safer unique index that only applies when student and menu exist
        try {
          await coll.createIndex(
            { student: 1, menu: 1, mealType: 1 },
            { unique: true, partialFilterExpression: { student: { $exists: true }, menu: { $exists: true } }, background: true }
          );
          console.log('Created/ensured ratings unique index (partial on exists)');
        } catch (createErr) {
          console.warn('Could not create ratings index automatically:', createErr.message || createErr);
        }
      }
    } catch (idxErr) {
      console.warn('Warning: could not access Rating collection to manage indexes:', idxErr.message || idxErr);
    }
    
    // Also ensure attendance indexes are consistent with the schema.
    try {
      const Attendance = require('../models/Attendance');
      if (Attendance && Attendance.collection) {
        const collA = Attendance.collection;
        try {
          const indexesA = await collA.indexes();
          const hasOldA = indexesA.some(ix => ix.name === 'userId_1_date_1_mealType_1');
          if (hasOldA) {
            await collA.dropIndex('userId_1_date_1_mealType_1');
            console.log('Dropped old attendance index userId_1_date_1_mealType_1');
          }
        } catch (dropErrA) {
          console.warn('Could not drop old attendance index (continuing):', dropErrA.message || dropErrA);
        }

        try {
          await collA.createIndex(
            { student: 1, date: 1, mealType: 1 },
            { unique: true, partialFilterExpression: { student: { $exists: true } }, background: true }
          );
          console.log('Created/ensured attendance unique index (partial on student exists)');
        } catch (createErrA) {
          console.warn('Could not create attendance index automatically:', createErrA.message || createErrA);
        }
      }
    } catch (attIdxErr) {
      console.warn('Warning: could not access Attendance collection to manage indexes:', attIdxErr.message || attIdxErr);
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = { connectDB, mongoose };
