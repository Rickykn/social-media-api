// Data access layer

const { Post, User, Like } = require("./sequelize")

class DAO {
  constructor(model) {
    this.model = model
    this.models = {
      Post: Post,
      User: User,
      Like: Like
    }
  }

  findAndCountAll = async (query) => {
    try {
      const {
        _limit = 30,
        _page = 1,
        _sortBy = "",
        _sortDir = "",
        _include = undefined,
        _includeAs = undefined
      } = query

      delete query._limit
      delete query._page
      delete query._sortBy
      delete query._sortDir
      delete query._include
      delete query._includeAs

      const findModel = await this.model.findAndCountAll({
        where: {
          ...query
        },
        limit: _limit ? parseInt(_limit) : undefined,
        offset: (_page - 1) * _limit,
        include: _include ? [
          {
            model: this.models[_include],
            as: _includeAs
          }
        ] : undefined,
        order: _sortBy ? [[_sortBy, _sortDir]] : undefined,
        distinct: true
      })

      return findModel;
    } catch (err) {
      return err
    }
  }
}

module.exports = DAO