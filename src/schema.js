const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type Query {
        authInfo: Auth
        account: User
        code(id: Int): CodeSample
        codeList: [CodeSample]
    }

    type Mutation {
        register(login: String, password: String): User
        authorize(login: String, password: String): Auth
        unauthorize: Boolean
        createCode(name: String, code: String): Int
        editCode(id: Int, name: String, code: String): Boolean
        deleteCode(id: Int): Boolean
    }

    type CodeSample {
        id: Int
        name: String
        code: String
        editedTime: String
        createdTime: String
    }

    type User {
        id: Int
        name: String
        lastname: String
        login: String
        password: String
        registeredTime: String
    }    

    type Auth {
        id: Int
        token: String
    }
`);