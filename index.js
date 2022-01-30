const Fastify = require('fastify');
const { PrismaClient } = require('@prisma/client');
const _ = require("lodash");
const USID = require('usid');
const path = require('path');

require('dotenv').config();

async function start() {
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
			const token = req.headers.authorization.split(' ')[ 1 ];
			const decoded = await app.jwt.verify(token);
			req.user = await app.prisma.user.findUnique({ where: { id: decoded.user } })
			console.log('valdated')
		} catch (error) {
			req.user = null;
		}
	})

	return app.listen(process.env.PORT || 3000, (err, address) => {
		if (err) throw err
		app.log.info(`server listening on ${address}`);
	})
}


start()