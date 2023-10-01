import gql from "graphql-tag";
import * as Urql from "urql";
import { Application, ApplicationInputsArgs, Omit } from "../graphql";

const Applications = gql`
    query applications($where: ApplicationWhereInput) {
        applications(where: $where) {
            id
        }
    }
`;

interface Applications {
    applications: Application[];
}

const useApplications = (
    options?: Omit<Urql.UseQueryArgs<ApplicationInputsArgs>, "query">,
) => {
    return Urql.useQuery<Applications, ApplicationInputsArgs>({
        query: Applications,
        ...options,
    });
};

export default useApplications;
