# SplitCoin
This project contains the React Frontend and Ethereum Smart Contracts for the SplitCoin project. The frontend is built to facilitate the creation of SplitCoin contracts. These contracts are configured with a list of users and percentages. The contract ensures that each user gets their assigned percentage of Ether that is received by the contract. 

In this way, this project is for deploying income splitting contracts. 

The UI should facilitate the creation of contracts and recieving of the divided funds.


## Running The Application
To run locally this application requires testrpc.
```npm install -g ethereumjs-testrpc && testrpc```

Once testrpc is installed and running, check the tests in the src/blockchain directory
```truffle compile && truffle test```

If the tests are successful, then the app can be run with
```npm start```

## Developer Fee
The contracts deployed through this interface have a 0.25% developer fee. As other developers contribute, a SplitCoin contract can be built so that all contributers receive a portion of the developer fee.
