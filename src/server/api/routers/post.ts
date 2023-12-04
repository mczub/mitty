import { any, z } from "zod";

import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { gql, GraphQLClient } from 'graphql-request';

import { getParamsFromUrl, PhaseInfo, PhaseMitTimeline, rangeToArray } from '~/server/utils';

const fflogsEndpoint = "https://www.fflogs.com/api/v2/client"

const fflogsClient = new GraphQLClient(fflogsEndpoint, {
  headers: { authorization: `Bearer ${env.FFLOGS_ACCESS_TOKEN}` }
});

const fflogsFullReportQuery = gql`
  query getReport($reportCode: String!)
  {
    reportData {
      report(code: $reportCode) {
        title
        startTime
        endTime
        code
        fights {
          id
          name
          startTime
          endTime
          lastPhase
          bossPercentage
          fightPercentage
          kill
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
        startTime
        endTime
        code
        playerDetails(fightIDs: [$fightId])
        fights(fightIDs: [$fightId]) {
          id
          name
          startTime
          endTime
          lastPhase
          bossPercentage
          fightPercentage
          kill
          gameZone {
            name
          }
        }
        events(fightIDs: [$fightId], dataType: DamageTaken, filterExpression: $filter, limit: 2000) {
          data
        }
        deaths: events(fightIDs: [$fightId], dataType: Deaths) {
          data
        }
        targetabilityUpdates: events(fightIDs: [$fightId], filterExpression: "type = \\\"targetabilityupdate\\\"") {
          data
        }
        enemyCastEvents: events(fightIDs: [$fightId], dataType: Casts, hostilityType: Enemies, filterExpression: "type = \\\"cast\\\"", limit: 2000) {
          data
        }
        masterData {
          abilities {
            gameID
            name
            type
          }
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
        abilityIndex: [0, 1, 2, 3, 4, 5, 6, 7],
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
  },
  { 
    phaseNumber: 3,
    damageEvents: [
      {
        mechId: "p3-hello-world",
        mechName: "Hello, World",
        abilityId: 31573,
        abilityName: "Hello, World",
        abilityIndex: [0, 1, 2, 3, 4, 5, 6, 7],
      },
      {
        mechId: "p3-patch-1",
        mechName: "1st Patch",
        abilityId: 31587,
        abilityName: "Patch",
        abilityIndex: rangeToArray(0, 31),
      },
      {
        mechId: "p3-patch-2",
        mechName: "2nd Patch",
        abilityId: 31587,
        abilityName: "Patch",
        abilityIndex: rangeToArray(32, 63),
      },
      {
        mechId: "p3-patch-3",
        mechName: "3rd Patch",
        abilityId: 31587,
        abilityName: "Patch",
        abilityIndex: rangeToArray(64, 95),
      },
      {
        mechId: "p3-patch-4",
        mechName: "4th Patch",
        abilityId: 31587,
        abilityName: "Patch",
        abilityIndex: rangeToArray(96, 127),
      },
      {
        mechId: "p3-critical-error",
        mechName: "Critical Error",
        abilityId: 31588,
        abilityName: "Critical Error",
        abilityIndex: [0, 1, 2, 3, 4, 5, 6, 7],
      },
    ]
  },
  {
    phaseNumber: 4,
    damageEvents: [
      {
        mechId: "p4-protean-1",
        mechName: "Protean 1",
        abilityId: 31614,
        abilityName: "Wave Cannon",
        abilityIndex: rangeToArray(0, 7)
      },
      {
        mechId: "p4-stack-1",
        mechName: "Stack 1",
        abilityId: 31615,
        abilityName: "Wave Cannon",
        abilityIndex: rangeToArray(0, 7)
      },
      {
        mechId: "p4-protean-2",
        mechName: "Protean 2",
        abilityId: 31614,
        abilityName: "Wave Cannon",
        abilityIndex: rangeToArray(8, 15)
      },
      {
        mechId: "p4-stack-2",
        mechName: "Stack 2",
        abilityId: 31615,
        abilityName: "Wave Cannon",
        abilityIndex: rangeToArray(8, 15)
      },
      {
        mechId: "p4-protean-3",
        mechName: "Protean 3",
        abilityId: 31614,
        abilityName: "Wave Cannon",
        abilityIndex: rangeToArray(16, 23)
      },
      {
        mechId: "p4-stack-3",
        mechName: "Stack 3",
        abilityId: 31615,
        abilityName: "Wave Cannon",
        abilityIndex: rangeToArray(16, 23)
      },
      {
        mechId: "p4-blue-screen",
        mechName: "Blue Screen",
        abilityId: 31612,
        abilityName: "Blue Screen",
        abilityIndex: rangeToArray(0, 7)
      }
    ]
  },
  {
    phaseNumber: 5,
    damageEvents: [
      {
        mechId: "p5-delta-cast",
        mechName: "Delta Cast",
        abilityId: 31624,
        abilityName: "Run: ****mi* (Delta Version)",
        abilityIndex: rangeToArray(0, 7)
      },
      {
        mechId: "p5-delta-mechanic",
        mechName: "Delta Mechanic",
        abilityId: 31587,
        abilityName: "Patch",
        abilityIndex: rangeToArray(128, 191)
      },
      {
        mechId: "p5-sigma-cast",
        mechName: "Sigma Cast",
        abilityId: 32788,
        abilityName: "Run: ****mi* (Sigma Version)",
        abilityIndex: rangeToArray(0, 7)
      },
      {
        mechId: "p5-sigma-clocks",
        mechName: "Sigma Mechanic (Clock Spots)",
        abilityId: 31604,
        abilityName: "Wave Cannon",
        abilityIndex: rangeToArray(0, 5)
      },
      {
        mechId: "p5-sigma-towers",
        mechName: "Sigma Mechanic (Towers)",
        abilityId: 31493,
        abilityName: "Storage Violation",
        abilityIndex: rangeToArray(0, 4)
      },
      {
        mechId: "p5-sigma-near-far",
        mechName: "Sigma Mechanic (Near & Far)",
        abilityId: 33041,
        abilityName: "Hello, Distant World",
        abilityIndex: rangeToArray(2, 3)
      },
      {
        mechId: "p5-omega-cast",
        mechName: "Omega Cast",
        abilityId: 32789,
        abilityName: "Run: ****mi* (Omega Version)",
        abilityIndex: rangeToArray(0, 7)
      },
      {
        mechId: "p5-blind-faith",
        mechName: "Blind Faith",
        abilityId: 32626,
        abilityName: "Blind Faith",
        abilityIndex: rangeToArray(0, 7)
      },
    ]
  },
  {
    phaseNumber: 6,
    damageEvents: [
      {
        mechId: "p6-cosmo-memory",
        mechName: "Cosmo Memory",
        abilityId: 31649,
        abilityName: "Cosmo Memory",
        abilityIndex: rangeToArray(0, 7)
      },
      {
        mechId: "p6-cosmo-dive-1",
        mechName: "Cosmo Dive 1",
        abilityId: 31656,
        abilityName: "Cosmo Dive",
        abilityIndex: rangeToArray(0, 5)
      },
      {
        mechId: "p6-protean-1",
        mechName: "Protean 1",
        abilityId: 31659,
        abilityName: "Wave Cannon",
        abilityIndex: rangeToArray(0, 7)
      },
      {
        mechId: "p6-wave-cannon-1",
        mechName: "Wave Cannon 1",
        abilityId: 31658,
        abilityName: "Wave Cannon",
        abilityIndex: rangeToArray(0, 7)
      },
      {
        mechId: "p6-protean-2",
        mechName: "Protean 2",
        abilityId: 31659,
        abilityName: "Wave Cannon",
        abilityIndex: rangeToArray(8, 15)
      },
      {
        mechId: "p6-wave-cannon-2",
        mechName: "Wave Cannon 2",
        abilityId: 31658,
        abilityName: "Wave Cannon",
        abilityIndex: rangeToArray(8, 15)
      },
      {
        mechId: "p6-cosmo-dive-2",
        mechName: "Cosmo Dive 2",
        abilityId: 31656,
        abilityName: "Cosmo Dive",
        abilityIndex: rangeToArray(6, 11)
      },
      {
        mechId: "p6-cosmo-meteor-meteors",
        mechName: "Cosmo Meteor (Spread Meteors)",
        abilityId: 32699,
        abilityName: "Cosmo Meteor",
        abilityIndex: rangeToArray(0, 15)
      },
      {
        mechId: "p6-cosmo-meteor-flares",
        mechName: "Cosmo Meteor (Flares)",
        abilityId: 31667,
        abilityName: "Cosmo Meteor",
        abilityIndex: rangeToArray(0, 4)
      },
      {
        mechId: "p6-magic-number-1",
        mechName: "Magic Number 1",
        abilityId: 31670,
        abilityName: "Magic Number",
        abilityIndex: rangeToArray(0, 7)
      },
      {
        mechId: "p6-magic-number-2",
        mechName: "Magic Number 2",
        abilityId: 31670,
        abilityName: "Magic Number",
        abilityIndex: rangeToArray(8, 15)
      },
    ]
  }
]

const topPhaseMitTimelines: PhaseMitTimeline[] = [
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
        ]
      },
      {
        mechId: "p1-pantokrator-stack-3",
        mechName: "3rd Stack",
        expectedMits: [
          { name: "Reprisal", abilityId: 1001193, jobs: ['WAR', 'PLD', 'GNB', 'DRK'] },
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
          { name: "Heart of Light", abilityId: 1001839, jobs: ['GNB'] },
          { name: "Dark Missionary", abilityId: 1001894, jobs: ['DRK'] },
          { name: "Galvanize", abilityId: 1000297, jobs: ['SCH'] },
          { name: "Sacred Soil", abilityId: 1000299, jobs: ['SCH'] },
          { name: "Expedience", abilityId: 1002711, jobs: ['SCH'] },
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
          { name: "Heart of Light", abilityId: 1001839, jobs: ['GNB'] },
          { name: "Dark Missionary", abilityId: 1001894, jobs: ['DRK'] },
          { name: "Galvanize", abilityId: 1000297, jobs: ['SCH'] },
          { name: "Sacred Soil", abilityId: 1000299, jobs: ['SCH'] },
          { name: "Expedience", abilityId: 1002711, jobs: ['SCH'] },
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
  },
  { 
    phaseNumber: 3,
    expectedMitEvents: [
      {
        mechId: "p3-hello-world",
        mechName: "Hello, World",
        expectedMits: []
      },
      {
        mechId: "p3-patch-1",
        mechName: "1st Patch",
        expectedMits: []
      },
      {
        mechId: "p3-patch-2",
        mechName: "2nd Patch",
        expectedMits: []
      },
      {
        mechId: "p3-patch-3",
        mechName: "3rd Patch",
        expectedMits: []
      },
      {
        mechId: "p3-patch-4",
        mechName: "4th Patch",
        expectedMits: []
      },
      {
        mechId: "p3-critical-error",
        mechName: "Critical Error",
        expectedMits: []
      },
    ]
  },
  {
    phaseNumber: 4,
    expectedMitEvents: [
      {
        mechId: "p4-protean-1",
        mechName: "Protean 1",
        expectedMits: []
      },
      {
        mechId: "p4-stack-1",
        mechName: "Stack 1",
        expectedMits: []
      },
      {
        mechId: "p4-protean-2",
        mechName: "Protean 2",
        expectedMits: []
      },
      {
        mechId: "p4-stack-2",
        mechName: "Stack 2",
        expectedMits: []
      },
      {
        mechId: "p4-protean-3",
        mechName: "Protean 3",
        expectedMits: []
      },
      {
        mechId: "p4-stack-3",
        mechName: "Stack 3",
        expectedMits: []
      },
      {
        mechId: "p4-blue-screen",
        mechName: "Blue Screen",
        expectedMits: []
      }
    ]
  },
  {
    phaseNumber: 5,
    expectedMitEvents: [
      {
        mechId: "p5-delta-cast",
        mechName: "Delta Cast",
        expectedMits: []
      },
      {
        mechId: "p5-delta-mechanic",
        mechName: "Delta Mechanic",
        expectedMits: []
      },
      {
        mechId: "p5-sigma-cast",
        mechName: "Sigma Cast",
        expectedMits: []
      },
      {
        mechId: "p5-sigma-clocks",
        mechName: "Sigma Mechanic (Clock Spots)",
        expectedMits: []
      },
      {
        mechId: "p5-sigma-towers",
        mechName: "Sigma Mechanic (Towers)",
        expectedMits: []
      },
      {
        mechId: "p5-sigma-near-far",
        mechName: "Sigma Mechanic (Near & Far)",
        expectedMits: []
      },
      {
        mechId: "p5-omega-cast",
        mechName: "Omega Cast",
        expectedMits: []
      },
      {
        mechId: "p5-blind-faith",
        mechName: "Blind Faith",
        expectedMits: []
      },
    ]
  }, 
  {
    phaseNumber: 6,
    expectedMitEvents: [
      {
        mechId: "p6-cosmo-memory",
        mechName: "Cosmo Memory",
        expectedMits: []
      },
      {
        mechId: "p6-cosmo-dive-1",
        mechName: "Cosmo Dive 1",
        expectedMits: []
      },
      {
        mechId: "p6-protean-1",
        mechName: "Protean 1",
        expectedMits: []
      },
      {
        mechId: "p6-wave-cannon-1",
        mechName: "Wave Cannon 1",
        expectedMits: []
      },
      {
        mechId: "p6-protean-2",
        mechName: "Protean 2",
        expectedMits: []
      },
      {
        mechId: "p6-wave-cannon-2",
        mechName: "Wave Cannon 2",
        expectedMits: []
      },
      {
        mechId: "p6-cosmo-dive-2",
        mechName: "Cosmo Dive 2",
        expectedMits: []
      },
      {
        mechId: "p6-cosmo-meteor-meteors",
        mechName: "Cosmo Meteor (Spread Meteors)",
        expectedMits: []
      },
      {
        mechId: "p6-cosmo-meteor-flares",
        mechName: "Cosmo Meteor (Flares)",
        expectedMits: []
      },
      {
        mechId: "p6-magic-number-1",
        mechName: "Magic Number 1",
        expectedMits: []
      },
      {
        mechId: "p6-magic-number-2",
        mechName: "Magic Number 2",
        expectedMits: []
      },
    ]
  }
]



export const postRouter = createTRPCRouter({
  getLogData: publicProcedure
    .input(z.object({ reportCode: z.string(), fightId: z.string() }))
    .query(async ({ input }) => {
      let fightData;
      if (!input.fightId) {
        fightData = await fflogsClient.request<any>(fflogsFullReportQuery, {...input});
      } else {
        fightData = await fflogsClient.request<any>(fflogsSingleFightQuery, {...input, fightId: parseInt(input.fightId), filter: `type = "calculateddamage"`});
      }
      
      return {
        params: input,
        fightData: fightData
      }
    }),

  getReportData: publicProcedure
    .input(z.object({ reportCode: z.string() }))
    .query(async ({ input }) => {
      const fightData = await fflogsClient.request<any>(fflogsFullReportQuery, {...input});
      
      return {
        params: input,
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
