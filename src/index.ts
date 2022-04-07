require('dotenv').config();
import axios from "axios";
import express, { Request, response, Response } from "express";
import url from 'url';

const PORT = process.env.PORT || 3001;
const app = express();
let accessToken = '';
let refreshToken = '';

app.get("/api/discord/redirect", async (req: Request, res: Response) => {
    console.log(req.query);
    const { code } = req.query;
    if (code) {
        try {
            const formData = new url.URLSearchParams({
                'client_id': process.env.CLIENT_ID?.toString() || '',
                'client_secret': process.env.CLIENT_SECRET?.toString() || '',
                'grant_type': 'authorization_code',
                'code': code?.toString(),
                'redirect_uri': 'http://localhost:3001/api/discord/redirect'
            });
            const response = await axios.post('https://discord.com/api/v8/oauth2/token', formData.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
            const { access_token, refresh_token } = response.data;
            accessToken = access_token;
            refreshToken = refresh_token;

            res.sendStatus(200);
        } catch (error) {
            console.log(error);
            res.sendStatus(400)
        }
    }
});

app.get('/api/auth/user', async (req: Request, res: Response) => {
    try {
        const response = await axios.get('https://discord.com/api/v8/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        res.send(response.data);
    } catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
});

app.get('/api/auth/revoke', async (req: Request, res: Response) => {
    const formData = new url.URLSearchParams({
        client_id: process.env.CLIENT_ID?.toString() || '',
        client_secret: process.env.CLIENT_SECRET?.toString() || '',
        token: accessToken
    });
    try {
        const response = await axios.post('https://discord.com/api/v8/oauth2/token/revoke', formData.toString(),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        res.send(response.data)
    } catch (error) {
        console.log(error)
        res.sendStatus(400);
        
    }
})

app.listen(PORT, () => console.log(`running on port ${PORT}`));