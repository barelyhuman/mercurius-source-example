"use strict";

const Fastify = require("fastify");
const mercurius = require("mercurius");
const fs = require("fs");
const { getDirective, filterSchema } = require("@graphql-tools/utils");
const { makeExecutableSchema } = require("@graphql-tools/schema");

run();

async function run() {
  const addResolver = async (_, { x, y }) => x + y;
  const resolvers = {
    Query: {
      add: addResolver,
      externalAdd: addResolver,
    },
  };

  const app = Fastify();
  app.register(mercurius, {
    schema: exposeTransformer(await prepareSchema(resolvers), "internal"),
    routes: true,
    graphiql: true,
  });

  app.get("/", async function (_, reply) {
    const query = "{ add(x: 2, y: 2) }";
    return reply.graphql(query);
  });

  app.listen({ port: 3000 });
}

function exposeTransformer(schema, forSource = "") {
  return filterSchema({
    schema,
    rootFieldFilter: (_typeName, _fieldName, fieldConfig) => {
      const hasExpose = getDirective(schema, fieldConfig, "expose")?.[0];
      if (!hasExpose) return true;
      const { source } = hasExpose;
      if (!source.includes(forSource)) return false;
      return true;
    },
    fieldFilter: (_typeName, _fieldName, fieldConfig) => {
      const hasExpose = getDirective(schema, fieldConfig, "expose")?.[0];
      if (!hasExpose) return true;
      const { source } = hasExpose;
      if (!source.includes(forSource)) return false;
      return true;
    },
  });
}

async function prepareSchema(resolvers) {
  const schema = await fs.promises.readFile("./schema/schema.gql", "utf8");
  return makeExecutableSchema({
    typeDefs: schema,
    resolvers,
  });
}
