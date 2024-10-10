import request from '@/utils/request'

// 查询部件数据列表
export function listComponentData(query) {
  return request({
    url: '/parts/componentData/list',
    method: 'get',
    params: query
  })
}

// 查询部件数据详细
export function getComponentData(id) {
  return request({
    url: '/parts/componentData/' + id,
    method: 'get'
  })
}

// 新增部件数据
export function addComponentData(data) {
  return request({
    url: '/parts/componentData',
    method: 'post',
    data: data
  })
}

// 修改部件数据
export function updateComponentData(data) {
  return request({
    url: '/parts/componentData',
    method: 'put',
    data: data
  })
}

// 删除部件数据
export function delComponentData(id) {
  return request({
    url: '/parts/componentData/' + id,
    method: 'delete'
  })
}
