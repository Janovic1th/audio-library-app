// lib/cognito.ts
import {
    CognitoUserPool,
    CognitoUser,
    AuthenticationDetails,
} from "amazon-cognito-identity-js";

const poolData = {
    UserPoolId: "eu-central-1_Kq2RAAnBB", // napr. eu-central-1_XXXXXXXXX
    ClientId: "4lfr0m53bhs32amfodnodh2c4s", // napr. 7k23du4e72ce58oe4qrcmpbv9l
};

export const userPool = new CognitoUserPool(poolData);