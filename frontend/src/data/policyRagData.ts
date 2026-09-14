import type { RagQaItem } from '../types/apix'

export const policyRagKnowledgeBase: RagQaItem[] = [
  {
    id: 'RAG-001',
    category: 'Methodology',
    question: 'Why does APIx employ the Jevons Geometric Mean instead of the traditional Carli formula?',
    answer:
      'According to the IMF CPI Manual (2020, Chapter 10: Scanner & Web-Scraped Data), volatile intraday dynamic airfares suffer from severe upward substitution bias when aggregated using the arithmetic Carli formula (often called the "Carli bounce" or upward drift). The Jevons Elementary Geometric Mean satisfies both the time reversal test (I(t/0) * I(0/t) = 1) and transitivity. This mathematically prevents high-frequency dynamic airline price fluctuations from artificially inflating the national Consumer Price Index.',
    citations: [
      {
        id: 'CIT-IMF-01',
        organization: 'IMF',
        title: 'Consumer Price Index Manual: Theory and Practice (2020)',
        reference: 'Chapter 10, Section 10.38 - Elementary Aggregate Index Number Formulas for Scanner Data',
        excerpt:
          'Geometric elementary indexes such as Jevons are strongly recommended for web-scraped dynamic prices to avoid the substantial upward bias characteristic of arithmetic averages like Carli.',
        relevanceScore: 0.98,
      },
      {
        id: 'CIT-MOSPI-01',
        organization: 'MoSPI',
        title: 'Report of the Committee on CPI Revision (Base 2024=100)',
        reference: 'Sub-group on Transport & Communication, Para 4.12',
        excerpt:
          'Transitioning high-frequency air travel price collection to geometric mean aggregation aligns with global modern statistical best practices.',
        relevanceScore: 0.94,
      },
    ],
  },
  {
    id: 'RAG-002',
    category: 'Ancillary Rules',
    question: 'How does deterministic fare decomposition isolate pure base airfare inflation from passenger add-ons?',
    answer:
      'Under MoSPI CPI guidelines, voluntary optional add-ons such as pre-booked hot meals, extra baggage allowances, and preferred seat selection fees represent changes in service consumption quantity or quality rather than pure transport price inflation. APIx utilizes deterministic schema validation to decompose every fare quote into Base Fare, Fuel Surcharge (ATF), and Airport Development Fees (UDF/PSF). All optional ancillary add-ons are completely stripped prior to index calculation.',
    citations: [
      {
        id: 'CIT-MOSPI-02',
        organization: 'MoSPI',
        title: 'Methodology of Consumer Price Index (Urban / Rural)',
        reference: 'Item Code 6.2.01 - Air Transport Fare Sampling Directives',
        excerpt:
          'The price representative of air travel must correspond to standard economy class transport between designated terminal cities, excluding extraneous service charges or voluntary passenger fees.',
        relevanceScore: 0.97,
      },
      {
        id: 'CIT-DGCA-01',
        organization: 'DGCA',
        title: 'Aeronautical Information Circular (AIC) - Passenger Tariff Transparency',
        reference: 'AIC No. 12/2021, Component Breakdown Requirements',
        excerpt:
          'Air carriers shall itemize tickets into basic fare, fuel surcharge, passenger service fee, and user development fee clearly in reservation payloads.',
        relevanceScore: 0.92,
      },
    ],
  },
  {
    id: 'RAG-003',
    category: 'Traffic Weighting',
    question: 'How are DGCA quarterly passenger volume weights (w_r) integrated into the Modified Laspeyres Index?',
    answer:
      'The composite national Airfare Price Index is computed via the Modified Laspeyres formulation: P_L = [sum(I_r * w_r) / sum(w_r)] * 100. The route weight w_r is derived from the Directorate General of Civil Aviation (DGCA) Quarterly Domestic Air Transport Traffic Reports. For example, high-density trunk routes like DEL-BOM (512k monthly pax) receive a 14.8% weight share, while regional UDAN connectivity corridors receive calibrated proportional shares, preventing regional flights from distorting national inflation trends.',
    citations: [
      {
        id: 'CIT-DGCA-02',
        organization: 'DGCA',
        title: 'Domestic Air Transport Monthly/Quarterly Traffic Reports (2024)',
        reference: 'Table 4: City-Pair Passenger Traffic Carried by Scheduled Domestic Airlines',
        excerpt:
          'The top 15 city-pairs account for over 46.2% of total domestic passenger throughput in Indian civil aviation.',
        relevanceScore: 0.96,
      },
      {
        id: 'CIT-EUROSTAT-01',
        organization: 'Eurostat',
        title: 'HICP Methodological Manual (Air Transport Index)',
        reference: 'Section 12.4.2 - Quantity Weights for Passenger Air Travel',
        excerpt:
          'Route weights should be updated regularly using official aviation authority passenger statistics to reflect contemporary transport demand.',
        relevanceScore: 0.89,
      },
    ],
  },
  {
    id: 'RAG-004',
    category: 'Compliance',
    question: 'How does the synthetic constant-horizon basket (T+1 to T+45) address advance purchase blindness?',
    answer:
      'Airline dynamic pricing yields 200%–400% price differences between a flight booked for tomorrow (T+1) versus one booked 45 days in advance (T+45). Measuring prices on inconsistent booking horizons introduces severe temporal sampling bias. APIx samples five fixed lead-time windows (T+1, T+7, T+15, T+30, T+45) every 6 hours, maintaining matched-model price constancy across time in accordance with UK ONS and Eurostat multilateral airfare guidelines.',
    citations: [
      {
        id: 'CIT-UK-ONS-01',
        organization: 'UK ONS',
        title: 'Research into Web-Scraped Data for CPI (Air Fares)',
        reference: 'Methodology Series 44, Section 3.2 - Sampling Time Horizons',
        excerpt:
          'Prices must be tracked at consistent lead times (e.g. 1 day, 1 week, 1 month before departure) to preserve product specification homogeneity over time.',
        relevanceScore: 0.99,
      },
    ],
  },
]
