#!/bin/bash
export REACT_APP_SPLITCOIN_FACTORY=$(cd ./src/blockchain/SplitCoinContract && truffle migrate | grep "SplitCoinFactory:" | cut -f 4 -d " ") 
export REACT_APP_TINYPROXY_FACTORY=$(cd ./src/blockchain/TinyProxyContract && truffle migrate | grep "TinyProxyFactory:" | cut -f 4 -d " ") 
echo $REACT_APP_SPLITCOIN_FACTORY
echo $REACT_APP_TINYPROXY_FACTORY
react-scripts-ts start
