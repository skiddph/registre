const Fastify = require('fastify');
const { PrismaClient } = require('@prisma/client');
const _ = require("lodash");
const USID = require('usid');
const path = require('path');

require('dotenv').config();

async function start(opts = {}) {
	const usid = new USID();
	const app = Fastify({ logger: true });
	const prisma = new PrismaClient({});

	app.decorate('prisma', prisma);
	await app.register(require('fastify-cors'), {})
	await app.register(require('fastify-jwt'), { secret: process.env.JWT_SECRET || usid.rand(24) })
	await app.register(require('./api'), { prefix: '/api' })
	
	if (process.env.NODE_ENV === 'production') {
		await app.register(require('fastify-static'), {
			root: path.join(__dirname, 'public')
		})

		app.get('*', async (req, res) => {
			res.redirect('/')
		})
	}

	await app.addHook('preValidation', async (req, res) => {
		req.user = null;
		try {
			if(!req.headers.authorization){
				return
			}
			const token = req.headers.authorization.split(' ')[ 1 ];

			let decoded;

			try {
				decoded = await app.jwt.verify(token);
			} catch (err) {
				return
			}
			
			req.user = await app.prisma.user.findUnique({ where: { id: decoded.user } })
			req.user = _.omit(req.user, ['hash'])
		} catch (e) {
			console.log(e)
			req.user = null;
		}
	})

	const handler = (err, address) => {
		if (err) throw err
		app.log.info(`server listening on ${address}`);
	}

	const PORT = process.env.PORT || opts?.port || 3000
	const HOST = process.env.HOST || opts?.host || false

	return HOST ? app.listen(PORT, HOST, handler) : app.listen(PORT, handler)
}


start({
	host: '0.0.0.0',
	port: '80'
})