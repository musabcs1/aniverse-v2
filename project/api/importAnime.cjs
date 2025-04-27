"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("firebase/app");
var firestore_1 = require("firebase/firestore");
var fs = require("fs");
var path = require("path");
// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDpU9R1Rg662_29X0nuUYBYylNWCmmYdYY",
    authDomain: "aniverse5.firebaseapp.com",
    projectId: "aniverse5",
    storageBucket: "aniverse5.firebasestorage.app",
    messagingSenderId: "486938827338",
    appId: "1:486938827338:web:4fe1d13775a1eafe28a4b3",
};
// Initialize Firebase
var app = (0, app_1.initializeApp)(firebaseConfig);
var db = (0, firestore_1.getFirestore)(app);
var animeListPath = path.resolve(__dirname, 'animeList.json');
var generateSlug = function (title) { return title.toLowerCase().replace(/\s+/g, '-'); };
var syncAnimeListToFirestore = function () { return __awaiter(void 0, void 0, void 0, function () {
    var animeList, animeCollection, _i, animeList_1, anime, animeDoc, animeWithSlug, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                animeList = JSON.parse(fs.readFileSync(animeListPath, 'utf-8'));
                animeCollection = (0, firestore_1.collection)(db, 'anime');
                _i = 0, animeList_1 = animeList;
                _a.label = 1;
            case 1:
                if (!(_i < animeList_1.length)) return [3 /*break*/, 4];
                anime = animeList_1[_i];
                animeDoc = (0, firestore_1.doc)(animeCollection, anime.id);
                animeWithSlug = { ...anime, slug: generateSlug(anime.title) };
                return [4 /*yield*/, (0, firestore_1.setDoc)(animeDoc, animeWithSlug)];
            case 2:
                _a.sent();
                console.log("Synced anime: ".concat(anime.title));
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4:
                console.log('Anime list synced successfully.');
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                console.error('Error syncing anime list:', error_1);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
// Watch for changes in animeList.json
fs.watchFile(animeListPath, { interval: 1000 }, function (curr, prev) {
    console.log('Detected changes in animeList.json. Syncing to Firestore...');
    syncAnimeListToFirestore();
});
// Initial sync
syncAnimeListToFirestore();
