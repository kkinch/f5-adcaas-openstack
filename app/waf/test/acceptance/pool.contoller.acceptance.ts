/**
 * Copyright 2019 F5 Networks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Client, expect, toJSON} from '@loopback/testlab';
import {WafApplication} from '../..';
import {
  setupApplication,
  teardownApplication,
  setupEnvs,
  teardownEnvs,
  setupDepApps,
  teardownDepApps,
} from '../helpers/testsetup-helper';
import {
  givenEmptyDatabase,
  givenPoolData,
  createPoolObject,
} from '../helpers/database.helpers';
import {
  ExpectedData,
  LetResponseWith,
} from '../fixtures/datasources/testrest.datasource';

describe('PoolController', () => {
  let wafapp: WafApplication;
  let client: Client;

  const prefix = '/adcaas/v1';

  before('setupApplication', async () => {
    await setupDepApps();
    ({wafapp, client} = await setupApplication());
    LetResponseWith();
    setupEnvs();
  });

  beforeEach('Empty database', async () => {
    await givenEmptyDatabase(wafapp);
  });

  after(async () => {
    await teardownApplication(wafapp);
    await teardownDepApps();
    teardownEnvs();
  });

  it('post ' + prefix + '/pools', async () => {
    const pool = createPoolObject();

    const response = await client
      .post(prefix + '/pools')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(pool)
      .expect(200);
    expect(response.body.pool.id)
      .to.not.empty()
      .and.type('string');
    expect(response.body.pool).to.containDeep(toJSON(pool));
  });

  it('get ' + prefix + '/pools', async () => {
    const pool = await givenPoolData(wafapp);

    const response = await client
      .get(prefix + '/pools')
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);
    expect(toJSON(pool)).to.containDeep(response.body.pools[0]);
  });

  it('get ' + prefix + '/pools/{id}', async () => {
    const pool = await givenPoolData(wafapp);

    const response = await client
      .get(prefix + `/pools/${pool.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);

    expect(response.body.pool.id).equal(pool.id);
  });

  it('patch ' + prefix + '/pools/{id}', async () => {
    const poolInDb = await givenPoolData(wafapp);
    // pzhang(NOTE): return no content
    let pool = createPoolObject({name: 'new name'});

    await client
      .patch(prefix + `/pools/${poolInDb.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .send(pool)
      .expect(204);

    await client
      .get(prefix + `/pools/${poolInDb.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(200);
  });

  it('delete ' + prefix + '/pools/{id}', async () => {
    const pool = await givenPoolData(wafapp);

    await client
      .del(prefix + `/pools/${pool.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(204);

    await client
      .get(prefix + `/pools/${pool.id}`)
      .set('X-Auth-Token', ExpectedData.userToken)
      .set('tenant-id', ExpectedData.tenantId)
      .expect(404);
  });
});
