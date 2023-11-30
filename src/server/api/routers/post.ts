import { any, z } from "zod";

import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { gql, GraphQLClient } from 'graphql-request';

import { getParamsFromUrl } from '~/server/utils';

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
  query getReport($reportCode: String!, $fightId: Int!)
  {
    reportData {
      report(code: $reportCode) {
        fights(fightIDs: [$fightId]) {
          id
          fightPercentage
          lastPhase
          gameZone {
            name
          }
        }
        events(fightIDs: [$fightId], dataType: DamageTaken) {
          data
        }
      }
    }
  }
`



export const postRouter = createTRPCRouter({
  getLogData: publicProcedure
    .input(z.object({ logUrl: z.string() }))
    .query(async ({ input }) => {
      const params = getParamsFromUrl(input.logUrl);
      let fightData;
      if (!params.fightId) {
        fightData = await fflogsClient.request<any>(fflogsFullReportQuery, params);
      } else {
        fightData = await fflogsClient.request<any>(fflogsSingleFightQuery, params);
      }
      
      return {
        url: input.logUrl,
        params: params,
        fightData: fightData
      }
    }),
});
