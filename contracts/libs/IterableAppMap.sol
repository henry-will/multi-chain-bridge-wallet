// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "../models/AppModel.sol";
import "./StringUtil.sol";

library IterableAppMap {
    struct Map {
        string[] keys;
        mapping(string => App) values;
        mapping(string => uint256) indexOf;
        mapping(string => bool) inserted;
    }

    function get(Map storage map, string memory key)
        public view
        returns (App memory)
    {
        return map.values[key];
    }

    function exist(Map storage map, string memory key)
        public view
        returns (bool)
    {
        App memory app = get(map, key);
        return StringUtil.stringCompare(key, app.key);
    }

    function getKeyAtIndex(Map storage map, uint256 index)
        public view
        returns (string memory)
    {
        return map.keys[index];
    }

    function size(Map storage map) 
        public view 
        returns (uint256) 
    {
        return map.keys.length;
    }

    function set( Map storage map, string memory key, App memory val ) 
        public 
    {
        if (map.inserted[key]) {
            map.values[key] = val;
        } else {
            map.inserted[key] = true;
            map.values[key] = val;
            map.indexOf[key] = map.keys.length;
            map.keys.push(key);
        }
    }

    function remove(Map storage map, string memory key) 
        public 
    {
        if (!map.inserted[key]) {
            return;
        }

        delete map.inserted[key];
        delete map.values[key];

        uint256 index = map.indexOf[key];
        string memory lastKey = removeKey(map, index);
        map.indexOf[lastKey] = index;
        delete map.indexOf[key];
    }

    function removeKey(Map storage map, uint256 keyIndex)
        private
        returns (string memory lastKey)
    {
        uint256 lastIndex = map.keys.length - 1;
        lastKey = map.keys[lastIndex];

        map.keys[keyIndex] = lastKey;
        map.keys.pop();
        return lastKey;
    }

    function getValues(Map storage map)
        public view
        returns (App[] memory)
    {
        uint256 totalSize = map.keys.length;
        App[] memory apps = new App[](totalSize);

        for (uint256 index = 0; index < totalSize; index++) {
            apps[index] = map.values[map.keys[index]];
        }
        return apps;
    }
}
