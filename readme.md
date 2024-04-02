
# Environment Specific Schema 


1. Single schema definition 
2. Exposes methods / fields only on specific environment 

**Example**



```graphql
type Query { 
    add(x:Int, y:Int): Int
}
```

Let's say we wish to only expose `add` query when the environment is `internal` then we can change the above to 

```graphql
type Query { 
    add(x:Int, y:Int): Int @expose(source: ["internal"])
}
```

Now when the server is started with `external` as the parameter in `exposeTransformer` the above will not be visible in the graphiql or be queriable from the api. 