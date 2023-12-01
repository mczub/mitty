import { any, z } from "zod";

import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { gql, GraphQLClient } from 'graphql-request';

import { getParamsFromUrl, PhaseInfo } from '~/server/utils';

const fflogsEndpoint = "https://www.fflogs.com/api/v2/client"

const fflogsClient = new GraphQLClient(fflogsEndpoint, {
  headers: { authorization: `Bearer ${env.FFLOGS_ACCESS_TOKEN}` }
});

const fflogsFullReportQuery = gql`
  query getReport($reportCode: String!)
  {
    reportData {
      report(code: $reportCode) {
        fights {
          id
          fightPercentage
          lastPhase
          gameZone {
            name
          }
        }
      }
    }
  }
`

const fflogsSingleFightQuery = gql`
  query getReport($reportCode: String!, $fightId: Int!, $filter: String)
  {
    reportData {
      report(code: $reportCode) {
        playerDetails(fightIDs: [$fightId])
        fights(fightIDs: [$fightId]) {
          id
          fightPercentage
          lastPhase
          kill
          gameZone {
            name
          }
        }
        events(fightIDs: [$fightId], dataType: DamageTaken, filterExpression: $filter) {
          data
        }
      }
    }
  }
`

const topFight = {

}

const topPhases: PhaseInfo[] = [
  {
    phaseNumber: 1,
    phaseName: "Omega"
  },
  {
    phaseNumber: 2,
    phaseName: "Omega-M/F"
  },
  {
    phaseNumber: 3,
    phaseName: "Omega Reconfigured"
  },
  {
    phaseNumber: 4,
    phaseName: "Blue Screen"
  },
  {
    phaseNumber: 5,
    phaseName: "Run: Dynamis"
  },
  {
    phaseNumber: 6,
    phaseName: "Alpha Omega"
  }
];

const topPhaseFightTimelines = [
  { 
    phaseNumber: 1,
    damageEvents: [
      {
        mechId: "p1-pantokrator",
        mechName: "Pantokrator",
        abilityId: 31502,
        abilityName: "Guided Missle Kyrios",
        abilityIndex: [0, 1],
      },
      {
        mechId: "p1-pantokrator-stack-1",
        mechName: "1st Stack",
        abilityId: 31503,
        abilityName: "Condensed Wave Cannon Kyrios",
        abilityIndex: [0, 1, 2, 3, 4, 5]
      },
      {
        mechId: "p1-pantokrator-stack-2",
        mechName: "2nd Stack",
        abilityId: 31503,
        abilityName: "Condensed Wave Cannon Kyrios",
        abilityIndex: [6, 7, 8, 9, 10, 11]
      },
      {
        mechId: "p1-pantokrator-stack-3",
        mechName: "3rd Stack",
        abilityId: 31503,
        abilityName: "Condensed Wave Cannon Kyrios",
        abilityIndex: [12, 13, 14, 15, 16, 17]
      },
      {
        mechId: "p1-pantokrator-stack-3",
        mechName: "4th Stack",
        abilityId: 31503,
        abilityName: "Condensed Wave Cannon Kyrios",
        abilityIndex: [18, 19, 20, 21, 22, 23]
      }
    ]
  }, 
  { 
    phaseNumber: 2,
    damageEvents: [
      {
        mechId: "p2-611-meteors",
        mechName: "611 (Flares)",
        abilityId: 31538,
        abilityName: "Optimized Meteor",
        abilityIndex: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
      },
      {
        mechId: "p2-611-pile-pitch",
        mechName: "611 (Pile Pitch)",
        abilityId: 31529,
        abilityName: "Pile Pitch",
        abilityIndex: [0, 1, 2, 3, 4, 5, 6],
      },
    ]
  }
]

const topPhaseMitTimelines = [
  { 
    phaseNumber: 1,
    expectedMitEvents: [
      {
        mechId: "p1-pantokrator",
        mechName: "Pantokrator",
        expectedMits: [
          { name: "Shake It Off", abilityId: 1001457, jobs: ['WAR'] },
          { name: "Divine Veil", abilityId: 1001362, jobs: ['PLD'] },
          { name: "Heart of Light", abilityId: 1001839, jobs: ['GNB'] },
          { name: "Dark Missionary", abilityId: 1001894, jobs: ['DRK'] },
          { name: "Tactician", abilityId: 1001951, jobs: ['MCH']},
          { name: "Troubadour", abilityId: 1001934, jobs: ['BRD']},
          { name: "Shield Samba", abilityId: 1001826, jobs: ['DNC']},
          { name: "Magick Barrier", abilityId: 1002707, jobs: ['RDM']},
        ]
      },
      {
        mechId: "p1-pantokrator-stack-1",
        mechName: "1st Stack",
        expectedMits: [
          { name: "Reprisal", abilityId: 1001193, jobs: ['WAR', 'PLD', 'GNB', 'DRK'] },
          { name: "Feint", abilityId: 1001195, jobs: ['MNK', 'NIN', 'RPR', 'DRG', 'SAM']},
        ]
      },
      {
        mechId: "p1-pantokrator-stack-2",
        mechName: "2nd Stack",
        expectedMits: [
          { name: "Reprisal", abilityId: 1001193, jobs: ['WAR', 'PLD', 'GNB', 'DRK'] },
          { name: "Seraphic Illumination", abilityId: 1001193, jobs: ['SCH'] },
        ]
      },
      {
        mechId: "p1-pantokrator-stack-3",
        mechName: "3rd Stack",
        expectedMits: [
          { name: "Reprisal", abilityId: 1001193, jobs: ['WAR', 'PLD', 'GNB', 'DRK'] },
          { name: "Seraphic Illumination", abilityId: 1001193, jobs: ['SCH'] },
          { name: "Feint", abilityId: 1001195, jobs: ['MNK', 'NIN', 'RPR', 'DRG', 'SAM']},
          { name: "Addle", abilityId: 1001203, jobs: ['RDM', 'SMN', 'BLM']},
          { name: "Dismantle", abilityId: 1000860, jobs: ['MCH']},
        ]
      },
      {
        mechId: "p1-pantokrator-stack-3",
        mechName: "4th Stack",
        expectedMits: []
      }
    ]
  },
  {
    phaseNumber: 2,
    expectedMitEvents: [
      {
        mechId: "p2-611-meteors",
        mechName: "611 (Flares)",
        expectedMits: [
          { name: "Shake It Off", abilityId: 1001457, jobs: ['WAR'] },
          { name: "Divine Veil", abilityId: 1001362, jobs: ['PLD'] },
          { name: "Passage of Arms", abilityId: 1001176, jobs: ['PLD']},
          { name: "Heart of Light", abilityId: 1001839, jobs: ['GNB'] },
          { name: "Dark Missionary", abilityId: 1001894, jobs: ['DRK'] },
          { name: "Seraphic Illumination", abilityId: 1001193, jobs: ['SCH'] },
          { name: "Spreadlo/Galvanize", abilityId: 1000297, jobs: ['SCH'] },
          { name: "Sacred Soil", abilityId: 1000299, jobs: ['SCH'] },
          { name: "Expedience", abilityId: 1002711, jobs: ['SCH'] },
          { name: "Fey Illumination", abilityId: 1000317, jobs: ['SCH']},
          { name: "Temperance", abilityId: 1001873, jobs: ['WHM']},
          { name: "Collective Unconscious", abilityId: 1000849, jobs: ['AST']},
          { name: "Neutral Sect", abilityId: 1001892, jobs: ['AST']},
          { name: "Tactician", abilityId: 1001951, jobs: ['MCH']},
          { name: "Troubadour", abilityId: 1001934, jobs: ['BRD']},
          { name: "Shield Samba", abilityId: 1001826, jobs: ['DNC']},
          { name: "Magick Barrier", abilityId: 1002707, jobs: ['RDM']},
        ]
      },
      {
        mechId: "p2-611-pile-pitch",
        mechName: "611 (Pile Pitch)",
        expectedMits: [
          { name: "Shake It Off", abilityId: 1001457, jobs: ['WAR'] },
          { name: "Divine Veil", abilityId: 1001362, jobs: ['PLD'] },
          { name: "Passage of Arms", abilityId: 1001176, jobs: ['PLD']},
          { name: "Heart of Light", abilityId: 1001839, jobs: ['GNB'] },
          { name: "Dark Missionary", abilityId: 1001894, jobs: ['DRK'] },
          { name: "Seraphic Illumination", abilityId: 1001193, jobs: ['SCH'] },
          { name: "Spreadlo/Galvanize", abilityId: 1000297, jobs: ['SCH'] },
          { name: "Sacred Soil", abilityId: 1000299, jobs: ['SCH'] },
          { name: "Expedience", abilityId: 1002711, jobs: ['SCH'] },
          { name: "Fey Illumination", abilityId: 1000317, jobs: ['SCH']},
          { name: "Temperance", abilityId: 1001873, jobs: ['WHM']},
          { name: "Collective Unconscious", abilityId: 1000849, jobs: ['AST']},
          { name: "Neutral Sect", abilityId: 1001892, jobs: ['AST']},
          { name: "Tactician", abilityId: 1001951, jobs: ['MCH']},
          { name: "Troubadour", abilityId: 1001934, jobs: ['BRD']},
          { name: "Shield Samba", abilityId: 1001826, jobs: ['DNC']},
          { name: "Magick Barrier", abilityId: 1002707, jobs: ['RDM']},
        ]
      },
    ]
  }
]



export const postRouter = createTRPCRouter({
  getLogData: publicProcedure
    .input(z.object({ logUrl: z.string() }))
    .query(async ({ input }) => {
      const params = getParamsFromUrl(input.logUrl);
      let fightData;
      if (!params.fightId) {
        fightData = await fflogsClient.request<any>(fflogsFullReportQuery, params);
      } else {
        fightData = await fflogsClient.request<any>(fflogsSingleFightQuery, {...params, filter: `(encounterPhase = 1 OR encounterPhase = 2) AND type = "calculateddamage"`});
      }
      
      return {
        url: input.logUrl,
        params: params,
        fightData: fightData
      }
    }),

  getFightPhaseInfo: publicProcedure
    .query(async ({ }) => {
      return topPhases;
    }),  

  getPhaseFightTimelines: publicProcedure
    .query(async ({ }) => {
      return topPhaseFightTimelines;
    }),

  getPhaseMitTimelines: publicProcedure
    .query(async ({ }) => {
      return topPhaseMitTimelines;
    }),
});
