// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
/**
@title Contract for DCSDedup v1
@author Zabreture
@notice 
FIndex, UList and other function
@dev    Gas consume is not considered
 */
contract dcsdedup {
    mapping(bytes32 => MetaData) FIndex;
    mapping(bytes32 => address[]) UList;

    struct MetaData {
        bytes32 head;
        bytes32 tail;
        // Split the fileID to save gas
    }

    function FIndexPut(bytes32 fileTag, bytes32 head, bytes32 tail) public returns(bool flag) {
        MetaData storage metadata = FIndex[fileTag];
        metadata.head = head;
        metadata.tail = tail;
        flag = true;
    }

    function FIndexGet(bytes32 fileTag) public view returns(bytes32 head, bytes32 tail) {
        MetaData memory metadata = FIndex[fileTag];
        head = metadata.head;
        tail = metadata.tail;
    }

    function UListGet(bytes32 fileTag) public view returns(address[] memory users){
        users = UList[fileTag];
    }

    function UListPut(bytes32 fileTag, address owner) public {
        UList[fileTag].push(owner);
    }
}