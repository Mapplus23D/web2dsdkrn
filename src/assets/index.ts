const icon_back = require('./icon_back.png')

//Layer
const bg_base_4d = require('./baseLayer/bg_base_4d.png')
const bg_base_baidu_image_layer = require('./baseLayer/bg_base_baidu_image_layer.png')
const bg_base_baidu_layer = require('./baseLayer/bg_base_baidu_layer.png')
const bg_base_changguang_layer = require('./baseLayer/bg_base_changguang_layer.png')
const bg_base_gaode_image_layer = require('./baseLayer/bg_base_gaode_image_layer.png')
const bg_base_gaode_layer = require('./baseLayer/bg_base_gaode_layer.png')
const bg_base_geovis_img_layer = require('./baseLayer/bg_base_geovis_img_layer.png')
const bg_base_geovis_ter_layer = require('./baseLayer/bg_base_geovis_ter_layer.png')
const bg_base_geovis_vec_layer = require('./baseLayer/bg_base_geovis_vec_layer.png')
const bg_base_minedata_img_layer = require('./baseLayer/bg_base_minedata_img_layer.png')
const bg_base_siwei_earth_layer = require('./baseLayer/bg_base_siwei_earth_layer.png')
const bg_base_tianditu_image_layer = require('./baseLayer/bg_base_tianditu_image_layer.png')
const bg_base_tianditu_layer = require('./baseLayer/bg_base_tianditu_layer.png')
const bg_base_tianditu_terrain_layer = require('./baseLayer/bg_base_tianditu_terrain_layer.png')
const bg_base_tx_dark_layer = require('./baseLayer/bg_base_tx_dark_layer.png')
const bg_base_tx_image_layer = require('./baseLayer/bg_base_tx_image_layer.png')
const bg_base_tx_layer = require('./baseLayer/bg_base_tx_layer.png')
const bg_base_tx_light_layer = require('./baseLayer/bg_base_tx_light_layer.png')
const bg_base_tx_terrain_layer = require('./baseLayer/bg_base_tx_terrain_layer.png')

const icon_aim_point = require('./icon_aim_point.png')
const icon_label = require('./icon_label.png')
const icon_line_black = require('./icon_line_black.png')
const icon_point_black = require('./icon_point_black.png')
const icon_region_black = require('./icon_region_black.png')

const images = {
  icon_back,

  // Layer
  bg_base_4d,
  bg_base_geovis_img_layer,
  bg_base_minedata_img_layer,
  bg_base_siwei_earth_layer,
  bg_base_geovis_ter_layer,
  bg_base_geovis_vec_layer,
  bg_base_changguang_layer,
  bg_base_gaode_layer,
  bg_base_gaode_image_layer,
  bg_base_baidu_layer,
  bg_base_baidu_image_layer,
  bg_base_tx_layer,
  bg_base_tx_dark_layer,
  bg_base_tx_light_layer,
  bg_base_tx_image_layer,
  bg_base_tx_terrain_layer,
  bg_base_tianditu_image_layer,
  bg_base_tianditu_layer,
  bg_base_tianditu_terrain_layer,

  icon_aim_point,
  icon_label,
  icon_line_black,
  icon_point_black,
  icon_region_black,
}

function getAssets(theme?: string) {
  switch (theme) {
    // case 'Light':
    //   return Light
    case 'Default':
    default:
      return Object.assign({}, images)
  }
}

export {
  getAssets
}

