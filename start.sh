#!/bin/bash
REACT_APP_SPLITCOIN_FACTORY=$(cd ./src/blockchain && truffle migrate | grep "SplitCoinFactory:" | cut -f 4 -d " ") react-scripts-ts start
