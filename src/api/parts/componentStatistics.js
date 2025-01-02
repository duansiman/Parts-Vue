import request from '@/utils/request'

// 查询部件数据列表
export function stat(query) {
  return request({
    url: '/parts/componentStatistics/stat',
    method: 'get',
    params: query
  })
}