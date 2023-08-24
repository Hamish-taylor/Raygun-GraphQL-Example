import logo from './logo.svg';
import './App.css';
import rg4js from 'raygun4js';

import { useEffect } from 'react';

import {
    graphql,
    GraphQLError,
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    buildSchema
} from 'graphql';

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    quoteOfTheDay(num: Int!): String
    random: Float!
    rollThreeDice: [Int]
  }
`);

// The root provides a resolver function for each API endpoint
var root = {
    quoteOfTheDay: function(args) {
        if (args.num > 1) {
            return new GraphQLError('num must be less than 1', {
                extensions: {
                    code: "FORBIDDEN",
                    SomeOtherKey: "Some other value",
                },
            })
        }

        return args.num < 0.5 ? 'Some Data' : 'Some Other Data';
    },
    random: () => {
        return Math.random();
    },
    rollThreeDice: () => {
        return [1, 2, 3].map((_) => 1 + Math.floor(Math.random() * 6));
    },
};

function App() {
    var source = '{ quoteOfTheDay(num: 2) }';


    useEffect(() => {
        //send a graphql request
        graphql({ schema, source, rootValue: root }).then((result) => {
            console.log(result);
            processesGraphQLError(result);
        });
    }, []);


    var processesGraphQLError = function(request) {
        if (request.errors) {
            request.errors.forEach(function(err) {
                console.log(err);
                rg4js('send', {
                    error: err,
                    customData: [{ key: 'query', value: err.source }],
                    tags: [err.extensions.code],
                }
                );
            })
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
        </div>
    );
}

export default App;
