import client from "@/app/client";
import { ApolloError } from "@apollo/client";
import { DocumentNode, OperationVariables } from "@apollo/client";

export async function graphQL_Query(
  query: DocumentNode,
  variables: OperationVariables,
  headers?: Record<string, string>
) {
  try {
    const { data, loading, error } = await client.query({
      query: query,
      fetchPolicy: "no-cache",
      variables: variables || null,
      context: {
        headers: headers || {},
      },
    });
    if (loading) {
      return null;
    }
    if (error) {
      console.error("Error fetching data:", error);
    }
    if (!data) {
      throw new Error("No data found");
    }
    return data;
  } catch (error: unknown) {
    if (error instanceof ApolloError) {
      return;
    } else if (error instanceof Error) {
      return;
    } else {
      console.error("Unknown error:", error);
    }
  }
}
