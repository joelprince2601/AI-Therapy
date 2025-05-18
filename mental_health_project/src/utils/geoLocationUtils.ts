/**
 * Geolocation utilities for detecting user location
 * Used to provide localized crisis resources
 */

export interface GeoLocation {
  country: string;
  countryCode: string;
  region?: string;
  city?: string;
  timezone?: string;
}

/**
 * Get user location based on IP address using ipinfo.io
 * @returns Promise resolving to GeoLocation object
 */
export const getUserLocation = async (): Promise<GeoLocation> => {
  try {
    // Using ipinfo.io free tier (no API key required for basic usage)
    const response = await fetch('https://ipinfo.io/json');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch location: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      country: data.country,
      countryCode: data.country,
      region: data.region,
      city: data.city,
      timezone: data.timezone
    };
  } catch (error) {
    console.error('Error getting user location:', error);
    // Default to US if location detection fails
    return {
      country: 'United States',
      countryCode: 'US'
    };
  }
};

/**
 * Get crisis resources based on user location
 * @param countryCode ISO country code (e.g., 'US', 'UK', 'AU')
 * @returns Object containing crisis resources for the specified country
 */
export const getCrisisResourcesByCountry = (countryCode: string): CrisisResources => {
  // Default to US resources if country not found
  return CRISIS_RESOURCES_BY_COUNTRY[countryCode] || CRISIS_RESOURCES_BY_COUNTRY['US'];
};

export interface CrisisResource {
  name: string;
  description: string;
  phone?: string;
  sms?: string;
  chat?: string;
  email?: string;
  website: string;
  hours?: string;
  languages?: string[];
}

export interface CrisisResources {
  country: string;
  emergencyNumber: string;
  resources: CrisisResource[];
}

// Crisis resources by country
export const CRISIS_RESOURCES_BY_COUNTRY: Record<string, CrisisResources> = {
  'US': {
    country: 'United States',
    emergencyNumber: '911',
    resources: [
      {
        name: '988 Suicide & Crisis Lifeline',
        description: 'The Lifeline provides 24/7, free and confidential support for people in distress, prevention and crisis resources.',
        phone: '988',
        sms: 'Text HOME to 741741',
        chat: 'https://988lifeline.org/chat/',
        website: 'https://988lifeline.org/',
        hours: '24/7',
        languages: ['English', 'Spanish']
      },
      {
        name: 'Crisis Text Line',
        description: 'Free, 24/7 support for those in crisis. Text with a trained Crisis Counselor.',
        sms: 'Text HOME to 741741',
        website: 'https://www.crisistextline.org/',
        hours: '24/7',
        languages: ['English']
      },
      {
        name: 'Veterans Crisis Line',
        description: 'Connects veterans and their families in crisis with qualified responders through a confidential toll-free hotline.',
        phone: '988, Press 1',
        sms: 'Text 838255',
        chat: 'https://www.veteranscrisisline.net/get-help/chat',
        website: 'https://www.veteranscrisisline.net/',
        hours: '24/7',
        languages: ['English']
      }
    ]
  },
  'UK': {
    country: 'United Kingdom',
    emergencyNumber: '999',
    resources: [
      {
        name: 'Samaritans',
        description: 'Provides emotional support to anyone in emotional distress or struggling to cope.',
        phone: '116 123',
        email: 'jo@samaritans.org',
        website: 'https://www.samaritans.org/',
        hours: '24/7',
        languages: ['English']
      },
      {
        name: 'SHOUT',
        description: 'Text service for anyone in crisis anytime, anywhere.',
        sms: 'Text SHOUT to 85258',
        website: 'https://giveusashout.org/',
        hours: '24/7',
        languages: ['English']
      },
      {
        name: 'CALM (Campaign Against Living Miserably)',
        description: 'Provides support to men in the UK who are down or in crisis.',
        phone: '0800 58 58 58',
        website: 'https://www.thecalmzone.net/',
        hours: '5pm-midnight, 365 days a year',
        languages: ['English']
      }
    ]
  },
  'CA': {
    country: 'Canada',
    emergencyNumber: '911',
    resources: [
      {
        name: 'Talk Suicide Canada',
        description: 'Free, confidential support to anyone thinking about suicide or concerned about someone else.',
        phone: '1-833-456-4566',
        sms: 'Text 45645 (4pm-midnight ET)',
        website: 'https://talksuicide.ca/',
        hours: '24/7 for calls, 4pm-midnight for texts',
        languages: ['English', 'French']
      },
      {
        name: 'Crisis Services Canada',
        description: 'Provides support and resources for those in crisis.',
        phone: '1-833-456-4566',
        sms: 'Text 45645',
        website: 'https://www.crisisservicescanada.ca/',
        hours: '24/7',
        languages: ['English', 'French']
      }
    ]
  },
  'AU': {
    country: 'Australia',
    emergencyNumber: '000',
    resources: [
      {
        name: 'Lifeline Australia',
        description: 'Crisis support and suicide prevention services.',
        phone: '13 11 14',
        sms: 'Text 0477 13 11 14',
        chat: 'https://www.lifeline.org.au/crisis-chat/',
        website: 'https://www.lifeline.org.au/',
        hours: '24/7',
        languages: ['English']
      },
      {
        name: 'Beyond Blue',
        description: 'Mental health support and resources.',
        phone: '1300 22 4636',
        chat: 'https://www.beyondblue.org.au/get-support/get-immediate-support',
        website: 'https://www.beyondblue.org.au/',
        hours: '24/7',
        languages: ['English']
      }
    ]
  },
  'NZ': {
    country: 'New Zealand',
    emergencyNumber: '111',
    resources: [
      {
        name: 'Lifeline Aotearoa',
        description: 'Confidential support for people experiencing emotional distress.',
        phone: '0800 543 354',
        sms: 'Text HELP to 4357',
        website: 'https://www.lifeline.org.nz/',
        hours: '24/7',
        languages: ['English']
      },
      {
        name: '1737 Need to Talk?',
        description: 'Free call or text to talk with a trained counsellor.',
        phone: '1737',
        sms: 'Text 1737',
        website: 'https://1737.org.nz/',
        hours: '24/7',
        languages: ['English']
      }
    ]
  },
  'IN': {
    country: 'India',
    emergencyNumber: '112',
    resources: [
      {
        name: 'AASRA',
        description: 'Crisis intervention center for the depressed and suicidal.',
        phone: '91-9820466726',
        website: 'http://www.aasra.info/',
        hours: '24/7',
        languages: ['English', 'Hindi']
      },
      {
        name: 'Vandrevala Foundation',
        description: 'Mental health support and crisis intervention.',
        phone: '1860 2662 345',
        website: 'https://www.vandrevalafoundation.com/',
        hours: '24/7',
        languages: ['English', 'Hindi']
      }
    ]
  },
  // Add more countries as needed
}; 