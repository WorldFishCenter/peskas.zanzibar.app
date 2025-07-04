const mongoose = require('mongoose');

// MongoDB connection
const uri = "mongodb+srv://worldfish:tK2WRR11hvxdBRzm@peskas-cluster.y9fcr.mongodb.net/portal-prod?retryWrites=true&w=majority&appName=peskas-cluster";

const monthlySummarySchema = new mongoose.Schema({
  district: String,
  date: Date,
  metric: String,
  value: Number,
  timestamp: Date,
});

async function checkMonthlyData() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const MonthlySummary = mongoose.model('monthly_summary', monthlySummarySchema, 'monthly_summaries');
    
    // Get the count
    const count = await MonthlySummary.countDocuments();
    console.log(`\nTotal monthly summaries: ${count}`);
    
    // Get unique districts
    const districts = await MonthlySummary.distinct('district');
    console.log(`\nDistricts: ${districts.join(', ')}`);
    
    // Get unique metrics
    const metrics = await MonthlySummary.distinct('metric');
    console.log(`\nMetrics: ${metrics.join(', ')}`);
    
    // Get date range
    const oldest = await MonthlySummary.findOne().sort({ date: 1 });
    const newest = await MonthlySummary.findOne().sort({ date: -1 });
    console.log(`\nDate range: ${oldest?.date} to ${newest?.date}`);
    
    // Get sample data for the last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const recentData = await MonthlySummary.find({
      date: { $gte: threeMonthsAgo }
    })
    .sort({ date: -1 })
    .limit(10);
    
    console.log('\nSample recent data:');
    recentData.forEach(doc => {
      console.log(`${doc.district} - ${doc.date.toISOString().split('T')[0]} - ${doc.metric}: ${doc.value}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkMonthlyData(); 