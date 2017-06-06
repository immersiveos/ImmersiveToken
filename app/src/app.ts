import '../stylesheets/app.css'

import 'web3'

import * as contract = require("truffle-contract");

// Import our contract artifacts and turn them into usable abstractions.
import artifacts from '../../build/contracts/ImmesriveToken.json'

let immersiveToken =  contract(artifacts);

class Foo {

    Bar () {
        const name = artifacts.name;
    }

}