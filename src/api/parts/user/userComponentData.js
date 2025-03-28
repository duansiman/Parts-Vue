import request from '@/utils/request'

// 查询部件数据列表
export function listComponentData(query) {
  return request({
    url: '/public/parts/componentData/list',
    method: 'get',
    params: query
  })
}

// 查询部件数据详细
export function getComponentData(id) {
  return request({
    url: '/public/parts/componentData/' + id,
    method: 'get'
  })
}

// 查询部件数据详细
export function parseElpData() {
  return request({
    url: '/public/parts/componentData/parseElp',
    method: 'post'
  })
}

// 新增部件数据
export function addComponentData(data) {
  return request({
    url: '/public/parts/componentData',
    method: 'post',
    data: data
  })
}

// 修改部件数据
export function updateComponentData(data) {
  return request({
    url: '/public/parts/componentData',
    method: 'put',
    data: data
  })
}

// 删除部件数据
export function delComponentData(id) {
  return request({
    url: '/public/parts/componentData/' + id,
    method: 'delete'
  })
}

export function uploadFilterFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    return request({
        url: '/public/parts/componentData/filterUpload',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form - data'
        }
    });
}

export function downloadComponentData(data) {
  return request({
    url: '/public/parts/componentData/download',
    method: 'post',
    params: data
  })
} 