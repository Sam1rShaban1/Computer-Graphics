// Building metadata with construction years and timeline assignments
export const BUILDING_TIMELINE = {
  2001: [
    '001',
    'library', 
    'cantine',
    'empty',
    'misc'
  ],
  2005: [
    '303',
    'lh1',
    'pavillion',
    'dorm3'
  ],
  2007: [
    '101',
    '101 classes',
    '101 under',
    'dorm5',
    'cantine inside'
  ],
  2010: [
    '803',
    '804',
    'library1',
    'dorm6'
  ],
  2013: [
    '806',
    '304',
    'dorm4',
    'conn'
  ],
  2016: [
    '809',
    'student service 2',
    'lh2',
    'dorm8',
    'dorm9'
  ],
  2019: [
    '812',
    'dorm7',
    'solar 1',
    '813'
  ],
  2022: [
    '818',
    'solar 2',
    '816',
    '817'
  ],
  2026: [
    '1001',
    '1002',
    'tech park',
    'book shop',
    'dorm1',
    'dorm2',
    'student service 1',
    '301',
    '302',
    '315',
    '400',
    '805',
    '807',
    '808',
    '810',
    '811',
    'change room'
  ]
};

// Timeline years to display (skipped years)
export const TIMELINE_YEARS = [2001, 2005, 2007, 2010, 2013, 2016, 2019, 2022, 2026];

// Building metadata
export const BUILDING_INFO = {
  '001': { name: 'Entry Building', description: 'Campus Entry Point' },
  'library': { name: 'Main Library', description: 'Original campus library' },
  'cantine': { name: 'Main Dining Hall', description: 'Original cafeteria' },
  '101': { name: 'Business Education Centre', description: 'Inaugurated 2007' },
  'dorm1': { name: 'Dormitory Block 1', description: 'First student housing' },
  'dorm2': { name: 'Dormitory Block 2', description: 'Early housing expansion' },
  'dorm3': { name: 'Dormitory Block 3', description: 'Student housing' },
  'dorm4': { name: 'Dormitory Block 4', description: 'Pre-BEC housing' },
  'dorm5': { name: 'Dormitory Block 5', description: 'Post-BEC expansion' },
  'dorm6': { name: 'Dormitory Block 6', description: '800-era housing' },
  'dorm7': { name: 'Dormitory Block 7', description: 'Modern dormitory' },
  'dorm8': { name: 'Dormitory Block 8', description: 'Recent housing' },
  'dorm9': { name: 'Dormitory Block 9', description: 'Newest housing' },
  '301': { name: 'Faculty Building A', description: 'Early expansion' },
  '302': { name: 'Faculty Building B', description: 'Academic expansion' },
  '303': { name: 'Faculty Building C', description: 'Academic expansion' },
  '304': { name: 'Faculty Building D', description: 'Pre-BEC phase' },
  '315': { name: 'Faculty Annex', description: 'Post-BEC expansion' },
  '400': { name: 'Research Center', description: 'Research focus facility' },
  '803': { name: 'New Campus Block 1', description: '800-series expansion' },
  '804': { name: 'New Campus Block 2', description: 'Continued growth' },
  '805': { name: 'New Campus Block 3', description: '800-series' },
  '806': { name: 'Innovation Center', description: 'Modern facilities' },
  '807': { name: 'Academic Complex 1', description: '800-series' },
  '808': { name: 'Academic Complex 2', description: '800-series' },
  '809': { name: 'Academic Complex 3', description: '800-series' },
  '810': { name: 'Academic Complex 4', description: '800-series' },
  '811': { name: 'Academic Complex 5', description: '800-series' },
  '812': { name: 'Academic Complex 6', description: '800-series' },
  '813': { name: 'Academic Complex 7', description: 'Recent construction' },
  '816': { name: 'Graduate Studies', description: 'Post-graduate facilities' },
  '817': { name: 'Conference Center', description: 'Event facilities' },
  '818': { name: 'Executive Building', description: 'Administration' },
  '1001': { name: 'Future Campus 1', description: '1000-series (newest)' },
  '1002': { name: 'Future Campus 2', description: 'Latest construction' },
  '101 classes': { name: 'BEC Classrooms Extension', description: 'Part of 101 complex' },
  '101 under': { name: 'BEC Underground/Annex', description: 'Basement/support' },
  'library1': { name: 'Library Extension', description: 'Expanded facilities' },
  'lh1': { name: 'Lecture Hall 1', description: 'Large classrooms' },
  'lh2': { name: 'Lecture Hall 2', description: 'Modern lecture space' },
  'student service 1': { name: 'Student Center 1', description: 'Early services' },
  'student service 2': { name: 'Student Center 2', description: 'Modern services' },
  'book shop': { name: 'Campus Bookstore', description: 'Textbooks/supplies' },
  'tech park': { name: 'Technology Park', description: 'Innovation hub' },
  'solar 1': { name: 'Solar Array 1', description: 'Renewable energy' },
  'solar 2': { name: 'Solar Array 2', description: 'Expanded solar' },
  'conn': { name: 'Campus Connector', description: 'Walkway/building link' },
  'change room': { name: 'Sports Facility', description: 'Athletics support' },
  'pavillion': { name: 'Outdoor Pavilion', description: 'Event space' },
  'cantine inside': { name: 'Indoor Dining Annex', description: 'Expanded dining' },
  'misc': { name: 'Utility Building', description: 'Maintenance/storage' },
  'empty': { name: 'Future Development', description: 'Reserved land' },
  'idk': { name: 'Unknown/Unnamed', description: 'Requires identification' }
};

export function getBuildingYear(buildingName) {
  for (const [year, buildings] of Object.entries(BUILDING_TIMELINE)) {
    if (buildings.includes(buildingName)) {
      return parseInt(year);
    }
  }
  return 2026; // Default to end
}

export function getBuildingsUpToYear(targetYear) {
  const result = [];
  for (const [year, buildings] of Object.entries(BUILDING_TIMELINE)) {
    if (parseInt(year) <= targetYear) {
      result.push(...buildings);
    }
  }
  return result;
}
