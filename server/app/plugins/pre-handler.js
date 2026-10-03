// fastify.decorateRequest('org', null);

// fastify.addHook('preHandler', async (req, reply) => {
//   const orgId = req.headers['x-org-id'];
//   if (!orgId) return reply.code(400).send({ message: 'Org required' });

//   req.org = { id: orgId };
// });
