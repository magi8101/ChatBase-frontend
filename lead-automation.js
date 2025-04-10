/**
 * Simple Lead Management System for Demo Purposes
 * This simulates basic lead tracking functionality without requiring a server/database
 */

// Define API configuration with placeholder values for GitHub 
const API_CONFIG = {
  BASE_URL: 'https://api-example-chatbot.example.com',
  API_KEY: 'YOUR_API_KEY_HERE',
  VERSION: 'v1'
};

// Create a self-executing function to avoid polluting the global namespace
(function() {
  class LeadManager {
    constructor() {
      this.leads = JSON.parse(localStorage.getItem('chatHubLeads') || '{}');
      this.leadActivities = JSON.parse(localStorage.getItem('chatHubLeadActivities') || '[]');
      this.apiBaseUrl = API_CONFIG.BASE_URL;
      console.log('Lead Manager initialized');
    }
    
    /**
     * Add or update a lead
     * @param {Object} lead - Lead object with required email property
     */
    addOrUpdateLead(lead) {
      if (!lead.email) {
        console.error('Lead must have an email');
        return;
      }
      
      // Get current timestamp
      const timestamp = new Date().toISOString();
      
      // If lead exists, update it, otherwise create new
      if (this.leads[lead.email]) {
        this.leads[lead.email] = {
          ...this.leads[lead.email],
          ...lead,
          updatedAt: timestamp
        };
      } else {
        this.leads[lead.email] = {
          ...lead,
          createdAt: timestamp,
          updatedAt: timestamp,
          score: this._calculateInitialScore(lead)
        };
      }
      
      // Track activity
      this._trackActivity({
        email: lead.email,
        type: this.leads[lead.email].createdAt === timestamp ? 'lead_created' : 'lead_updated',
        timestamp: timestamp,
        data: lead
      });
      
      // Save to localStorage
      this._saveLeads();
      
      return this.leads[lead.email];
    }
    
    /**
     * Get a lead by email
     * @param {string} email - Lead email
     */
    getLead(email) {
      return this.leads[email] || null;
    }
    
    /**
     * Get all leads
     */
    getAllLeads() {
      return Object.values(this.leads);
    }
    
    /**
     * Track a lead activity (pageview, chat, form submission, etc.)
     * @param {Object} activity - Activity object
     */
    trackActivity(activity) {
      if (!activity.email || !activity.type) {
        console.error('Activity must have email and type');
        return;
      }
      
      return this._trackActivity({
        ...activity,
        timestamp: activity.timestamp || new Date().toISOString()
      });
    }
    
    /**
     * Get activities for a specific lead
     * @param {string} email - Lead email
     */
    getLeadActivities(email) {
      return this.leadActivities.filter(activity => activity.email === email);
    }
    
    /**
     * Qualify a lead based on score and activity
     * @param {string} email - Lead email
     */
    qualifyLead(email) {
      const lead = this.leads[email];
      
      if (!lead) {
        return {
          qualified: false,
          score: 0,
          reason: 'Lead not found'
        };
      }
      
      // Get lead score (calculate or use existing)
      const score = lead.score || this._calculateLeadScore(email);
      
      // Save updated score
      this.leads[email].score = score;
      this._saveLeads();
      
      // Determine if qualified (score > 50 is qualified)
      const qualified = score >= 50;
      
      return {
        qualified,
        score,
        reason: qualified ? 'Lead score meets or exceeds qualification threshold' : 'Lead score below qualification threshold'
      };
    }
    
    // Private methods
    _trackActivity(activity) {
      this.leadActivities.push(activity);
      
      // Keep only last 1000 activities to prevent localStorage overflow
      if (this.leadActivities.length > 1000) {
        this.leadActivities = this.leadActivities.slice(-1000);
      }
      
      // Save to localStorage
      localStorage.setItem('chatHubLeadActivities', JSON.stringify(this.leadActivities));
      
      // Update lead score based on activity
      if (activity.email && this.leads[activity.email]) {
        const newScore = this._calculateLeadScore(activity.email);
        this.leads[activity.email].score = newScore;
        this._saveLeads();
      }
      
      return activity;
    }
    
    _calculateInitialScore(lead) {
      let score = 20; // Base score
      
      // Company provided (+10)
      if (lead.company) score += 10;
      
      // Name provided (+5)
      if (lead.name) score += 5;
      
      // Phone provided (+15)
      if (lead.phone) score += 15;
      
      // Query/message provided (+5)
      if (lead.query) score += 5;
      
      return score;
    }
    
    _calculateLeadScore(email) {
      const lead = this.leads[email];
      if (!lead) return 0;
      
      // Start with initial score calculation
      let score = this._calculateInitialScore(lead);
      
      // Get activities for this lead
      const activities = this.getLeadActivities(email);
      
      // Score based on activity count and recency
      const chatCount = activities.filter(a => a.type === 'chat_message').length;
      const pageViewCount = activities.filter(a => a.type === 'page_view').length;
      const formCount = activities.filter(a => a.type === 'form_submission').length;
      
      // Add points based on engagement
      score += Math.min(chatCount * 3, 15); // Up to 15 points for chat messages
      score += Math.min(pageViewCount, 10); // Up to 10 points for page views
      score += formCount * 10; // 10 points per form submission
      
      // Bonus points for login activity
      if (activities.some(a => a.type === 'login')) {
        score += 15;
      }
      
      // Return capped score (max 100)
      return Math.min(score, 100);
    }
    
    _saveLeads() {
      localStorage.setItem('chatHubLeads', JSON.stringify(this.leads));
    }
  }
  
  // Initialize and expose the lead manager globally
  window.leadManager = new LeadManager();
})();