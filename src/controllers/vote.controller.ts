import {intercept, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {del, getModelSchemaRef, param, post, requestBody} from '@loopback/rest';
import {ValidateVoteInterceptor} from '../interceptors';
import {Vote} from '../models';
import {VoteRepository} from '../repositories';
import {NotificationService} from '../services';
import {authenticate} from '@loopback/authentication';

@authenticate('jwt')
@intercept(ValidateVoteInterceptor.BINDING_KEY)
export class VoteController {
  constructor(
    @repository(VoteRepository)
    protected voteRepository: VoteRepository,
    @service(NotificationService)
    protected notificationService: NotificationService,
  ) {}

  @post('/votes', {
    responses: {
      '200': {
        description: 'Vote model instance',
        content: {'application/json': {schema: getModelSchemaRef(Vote)}},
      },
    },
  })
  async createVote(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Vote, {
            title: 'NewVote',
            exclude: ['toUserId'],
          }),
        },
      },
    })
    vote: Omit<Vote, 'id'>,
  ): Promise<Vote> {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const collection = (
      this.voteRepository.dataSource.connector as any
    ).collection(Vote.modelName);
    const query = {
      userId: vote.userId,
      type: vote.type,
      referenceId: vote.referenceId,
    };
    const update = {
      $set: vote,
    };
    const options = {upsert: true, returnOriginal: false};

    const result = await collection.findOneAndUpdate(query, update, options);

    try {
      await this.notificationService.sendPostVote(
        vote.userId,
        Object.assign(result.value, {
          id: result.value._id,
        }),
      );
    } catch {
      // ignore
    }

    return result;
  }

  @del('/votes/{id}', {
    responses: {
      '200': {
        description: 'Vote DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    return this.voteRepository.deleteById(id);
  }
}
