import App from './App.svelte';
import { Client, ThreadID } from '@textile/hub';
import { Database } from '@textile/threads-database';
import { Libp2pCryptoIdentity } from '@textile/threads-core';
import { debug } from 'svelte/internal';

const app = new App({
    target: document.body,
});

export default app;

const dummy = {
    $id: "https://example.com/dummy.json",
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Dummy",
    type: "object",
    required: ["_id"],
    properties: {
        _id: {
            type: "string",
            description: "The instance's id.",
        },
        name: {
            type: "string",
            description: "name for displaying in views"
        }
    }
};
// Start test code
// Prepare HUB DB
var threadId: ThreadID;
var keyInfoAccountSecure = { key: 'birp3hxmqfsvhwzymwvazedusya', secret: "bs43xte7fgkglo4vqei6oxeguktk3ny7qwoech3q" };
var keyInfoGroupSecure = { key: 'b252qixkcdci2hsroghdlmjeatu', secret: "bvc2zcgvn7pjjxzkezk4b2rvztguaxrgwis37ili" };
var localDb: Database;

async function demo() {
    debugger;

    var client = await Client.withKeyInfo(keyInfoAccountSecure);
    threadId = ThreadID.fromRandom();

    await client.newDB(threadId);
    await client.newCollection(threadId, "dummy", dummy);
    await client.create(threadId, "dummy", [{ _id: null, name: "name0" }, { _id: null, name: "name1" }, { _id: null, name: "name2" }, { _id: null, name: "name3" }]);
    console.debug("HUB DB content", (await client.find(threadId, "dummy", {})).instancesList);
    //Create localDB from HubInvite
    var invite = await client.getDBInfo(threadId);
    var identity = await Libp2pCryptoIdentity.fromRandom();
    localDb = await Database.withKeyInfo(keyInfoGroupSecure, (new Date()).toUTCString(), undefined, undefined);
    await localDb.startFromInfo(identity, invite);

    // Give the local DB some time to sync
    console.debug(localDb.collections.has("dummy") ? 'DUMMY COLLECTION SYNCED' : 'DUMMY COLLECTION NOT SYNCED');
    if (localDb.collections.has("dummy")) return; // all fine

    // Try way back
    var collection = await localDb.newCollection("dummy2", dummy);
    await collection.insert(...[{ _id: '01ed151phv26t2k09prqag02n4', name: "localItem" }]);
    var fromLocal = await collection.findById('01ed151phv26t2k09prqag02n4');

    // var fromRemote = [];
    // try {
    //     var client2 = await Client.withKeyInfo(keyInfoAccountSecure);
    //     fromRemote = (await client2.find(threadId, "dummy2", {})).instancesList;
    // }
    // catch (e) {
    //     console.error(e);
    // }

    // console.log("expected:", { _id: '01ed151phv26t2k09prqag02n4', name: "localItem" });
    console.log("local", fromLocal);
    // console.log("remote", fromRemote.find(x => x._id == '01ed151phv26t2k09prqag02n4'));

    //Cleanup HUB
}

async function cleanup() {
    var client = await Client.withKeyInfo(keyInfoAccountSecure);
    await client.deleteDB(threadId);
}

demo().then(async () => {


    console.log("Wait 10s for sync")
    setTimeout(async () => {
        console.log("ready");
        // debugger;
        // console.debug(localDb.collections.has("dummy") ? 'DUMMY COLLECTION SYNCED' : 'DUMMY COLLECTION NOT SYNCED');
        // if (localDb.collections.has("dummy")) return; // all fine

        // await localDb.close(); // Not closing local DB will crash the HUB
        // var fromRemote: any[] = [];
        // var client2: any;
        // try {
        //     client2 = await Client.withKeyInfo(keyInfoAccountSecure);
        //     fromRemote = (await client2.find(threadId, "dummy2", {})).instancesList;
        // }
        // catch (e) {
        //     console.error(e);
        // }

        // console.log("expected:", { _id: '01ed151phv26t2k09prqag02n4', name: "localItem" });
        // console.log("remote", fromRemote.find(x => x._id == '01ed151phv26t2k09prqag02n4'));

        // cleanup;
        // await client2.deleteDB(threadId);
    }, 10000);
});