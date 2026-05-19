/**
 * Mock 항공편 DB — 출국 / 귀국 분리
 * 실제 서비스에서는 국토교통부 항공정보포털 OpenAPI 사용
 */

/** 출국편 (한국 → 일본) — 일본 도착 정보 */
export interface OutboundFlight {
  airportId: string;   // 일본 도착 공항 (mockData airports.id)
  arrivalTime: string; // 'HH:mm'
}

/** 귀국편 (일본 → 한국) — 일본 출발 + 한국 도착 정보 */
export interface InboundFlight {
  airportId: string;       // 일본 출발 공항
  departureTime: string;   // 일본 현지 출발시각
  koreaAirport: string;    // 한국 도착 공항 (ICN/GMP/PUS 등)
  koreaArrivalTime: string;
}

export const OUTBOUND_FLIGHTS: Record<string, OutboundFlight> = {
  KE701: { airportId: 'narita', arrivalTime: '17:10' },
  KE703: { airportId: 'narita', arrivalTime: '12:50' },
  KE719: { airportId: 'haneda', arrivalTime: '14:55' },
  KE721: { airportId: 'haneda', arrivalTime: '21:30' },
  KE787: { airportId: 'fukuoka', arrivalTime: '11:25' },
  KE789: { airportId: 'fukuoka', arrivalTime: '16:30' },
  KE731: { airportId: 'kansai', arrivalTime: '12:15' },
  KE765: { airportId: 'shin-chitose', arrivalTime: '13:40' },
  KE767: { airportId: 'naha', arrivalTime: '12:25' },
  OZ102: { airportId: 'kansai', arrivalTime: '11:30' },
  OZ112: { airportId: 'narita', arrivalTime: '13:25' },
  OZ132: { airportId: 'naha', arrivalTime: '13:40' },
  OZ142: { airportId: 'shin-chitose', arrivalTime: '14:10' },
  OZ162: { airportId: 'fukuoka', arrivalTime: '12:35' },
  OZ172: { airportId: 'haneda', arrivalTime: '15:50' },
  JL094: { airportId: 'haneda', arrivalTime: '14:25' },
  JL958: { airportId: 'shin-chitose', arrivalTime: '12:50' },
  '7C1153': { airportId: 'fukuoka', arrivalTime: '13:20' },
  '7C1155': { airportId: 'fukuoka', arrivalTime: '18:40' },
  '7C1351': { airportId: 'naha', arrivalTime: '12:40' },
  '7C1402': { airportId: 'narita', arrivalTime: '11:50' },
  TW283: { airportId: 'narita', arrivalTime: '20:15' },
  LJ221: { airportId: 'kansai', arrivalTime: '10:45' },
  BX112: { airportId: 'chubu', arrivalTime: '15:30' },
};

/** 귀국편 — 보통 출국편 번호 + 1 (KE701 → KE702 식) */
export const INBOUND_FLIGHTS: Record<string, InboundFlight> = {
  KE702: { airportId: 'narita', departureTime: '18:50', koreaAirport: 'ICN', koreaArrivalTime: '21:30' },
  KE704: { airportId: 'narita', departureTime: '14:00', koreaAirport: 'ICN', koreaArrivalTime: '16:30' },
  KE720: { airportId: 'haneda', departureTime: '16:25', koreaAirport: 'ICN', koreaArrivalTime: '19:00' },
  KE722: { airportId: 'haneda', departureTime: '08:00', koreaAirport: 'ICN', koreaArrivalTime: '10:35' },
  KE788: { airportId: 'fukuoka', departureTime: '12:50', koreaAirport: 'ICN', koreaArrivalTime: '14:30' },
  KE790: { airportId: 'fukuoka', departureTime: '17:55', koreaAirport: 'ICN', koreaArrivalTime: '19:35' },
  KE732: { airportId: 'kansai', departureTime: '13:35', koreaAirport: 'ICN', koreaArrivalTime: '15:30' },
  KE766: { airportId: 'shin-chitose', departureTime: '15:10', koreaAirport: 'ICN', koreaArrivalTime: '18:30' },
  KE768: { airportId: 'naha', departureTime: '13:55', koreaAirport: 'ICN', koreaArrivalTime: '16:40' },
  OZ103: { airportId: 'kansai', departureTime: '13:00', koreaAirport: 'ICN', koreaArrivalTime: '14:55' },
  OZ113: { airportId: 'narita', departureTime: '14:55', koreaAirport: 'ICN', koreaArrivalTime: '17:30' },
  OZ133: { airportId: 'naha', departureTime: '15:10', koreaAirport: 'ICN', koreaArrivalTime: '17:45' },
  OZ143: { airportId: 'shin-chitose', departureTime: '15:40', koreaAirport: 'ICN', koreaArrivalTime: '19:00' },
  OZ163: { airportId: 'fukuoka', departureTime: '14:00', koreaAirport: 'ICN', koreaArrivalTime: '15:40' },
  OZ173: { airportId: 'haneda', departureTime: '17:20', koreaAirport: 'ICN', koreaArrivalTime: '20:00' },
  JL095: { airportId: 'haneda', departureTime: '15:55', koreaAirport: 'GMP', koreaArrivalTime: '18:30' },
  JL959: { airportId: 'shin-chitose', departureTime: '14:20', koreaAirport: 'ICN', koreaArrivalTime: '17:30' },
  '7C1154': { airportId: 'fukuoka', departureTime: '14:30', koreaAirport: 'ICN', koreaArrivalTime: '16:10' },
  '7C1156': { airportId: 'fukuoka', departureTime: '20:00', koreaAirport: 'ICN', koreaArrivalTime: '21:40' },
  '7C1352': { airportId: 'naha', departureTime: '13:40', koreaAirport: 'ICN', koreaArrivalTime: '16:25' },
  '7C1403': { airportId: 'narita', departureTime: '13:00', koreaAirport: 'ICN', koreaArrivalTime: '15:30' },
  TW284: { airportId: 'narita', departureTime: '21:30', koreaAirport: 'ICN', koreaArrivalTime: '00:10' },
  LJ222: { airportId: 'kansai', departureTime: '11:55', koreaAirport: 'ICN', koreaArrivalTime: '13:50' },
  BX113: { airportId: 'chubu', departureTime: '16:40', koreaAirport: 'PUS', koreaArrivalTime: '18:30' },
};

export function lookupOutbound(code: string): OutboundFlight | undefined {
  return OUTBOUND_FLIGHTS[code.trim().toUpperCase().replace(/\s/g, '')];
}

export function lookupInbound(code: string): InboundFlight | undefined {
  return INBOUND_FLIGHTS[code.trim().toUpperCase().replace(/\s/g, '')];
}
