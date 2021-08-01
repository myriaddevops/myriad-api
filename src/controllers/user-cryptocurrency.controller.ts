import {service} from '@loopback/core';
import {Count, CountSchema, repository} from '@loopback/repository';
import {del, getModelSchemaRef, post, requestBody} from '@loopback/rest';
import {UserCryptocurrency} from '../models';
import {UserCryptocurrencyRepository, UserRepository} from '../repositories';
import {CryptocurrencyService} from '../services';
// import { authenticate } from '@loopback/authentication';

// @authenticate("jwt")
export class UserCryptocurrencyController {
  constructor(
    @repository(UserRepository)
    protected userRepository: UserRepository,
    @repository(UserCryptocurrencyRepository)
    protected userCryptocurrencyRepository: UserCryptocurrencyRepository,
    @service(CryptocurrencyService)
    protected cryptocurrencyService: CryptocurrencyService,
  ) {}

  @post('/user-cryptocurrencies', {
    responses: {
      '200': {
        description: 'create a UserCryptocurrency model instance',
        content: {'application/json': {schema: getModelSchemaRef(UserCryptocurrency)}},
      },
    },
  })
  async createUserCryptocurrency(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserCryptocurrency, {
            title: 'NewUserCryptocurrency',
          }),
        },
      },
    })
    userCryptocurrency: UserCryptocurrency,
  ): Promise<UserCryptocurrency> {
    await this.cryptocurrencyService.isUserHasCrypto(
      userCryptocurrency.userId,
      userCryptocurrency.cryptocurrencyId,
    );

    return this.userCryptocurrencyRepository.create(userCryptocurrency);
  }

  @del('/user-cryptocurrencies', {
    responses: {
      '200': {
        description: 'User.Cryptocurrency DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserCryptocurrency, {
            title: 'NewUserCryptocurrency',
          }),
        },
      },
    })
    userCryptocurrency: UserCryptocurrency,
  ): Promise<Count> {
    return this.userCryptocurrencyRepository.deleteAll({
      userId: userCryptocurrency.userId,
      cryptocurrencyId: userCryptocurrency.cryptocurrencyId,
    });
  }
}