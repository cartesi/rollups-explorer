import gql from 'graphql-tag';
import * as Urql from 'urql';
import {Application, ApplicationInputsArgs, Omit, StatsQueryVariables} from "../graphql";

const Applications = gql`
    query applications(
        $where: ApplicationWhereInput
    ) {
        applications(
            where: $where
        ) {
            id
        }
    }
`;

interface Applications {
    data: {
        applications: Application[]
    }
}

const useApplications = (options?: Omit<Urql.UseQueryArgs<ApplicationInputsArgs>, 'query'>) => {
    return Urql.useQuery<Applications, ApplicationInputsArgs>({
        query: Applications,
        ...options
    } as Urql.UseQueryArgs<ApplicationInputsArgs, Applications>);
};

export default useApplications;