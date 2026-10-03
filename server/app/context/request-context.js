"use strict";
import { AsyncLocalStorage } from "node:async_hooks";

const storage = new AsyncLocalStorage();

const RequestContext = {
  set: (data) => storage.run(data, () => {}),
  get: () => storage.getStore(),
  getOrgId: () => storage.getStore()?.orgId,
};

export { storage, RequestContext };
