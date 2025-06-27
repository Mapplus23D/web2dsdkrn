const icon_back = require('./icon_back.png')
const icon_import = require('./icon_import.png')
const icon_loading = require('./icon_loading.png')
const icon_delete_black = require('./icon_delete_black.png')
const icon_save = require('./icon_save.png')
const icon_doc = require('./icon_doc.png')
const icon_add = require('./icon_add.png')

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

const icon_editor = require('./icon_editor.png')
const icon_aim = require('./icon_aim.png')
const icon_aim_disabled = require('./icon_aim_disabled.png')
const icon_hand_point = require('./icon_hand_point.png')
const icon_hand_point_disabled = require('./icon_hand_point_disabled.png')

const icon_node_add = require('./icon_node_add.png')
const icon_node_delete = require('./icon_node_delete.png')
const icon_node_edit = require('./icon_node_edit.png')
const icon_node_move = require('./icon_node_move.png')
const icon_node_select = require('./icon_node_select.png')
const icon_submit_black = require('./icon_submit_black.png')
const icon_close = require('./icon_close.png')

const icon_style_black = require('./icon_style_black.png')
const icon_symbol = require('./icon_symbol.png')

const icon_theme = require('./icon_theme.png')

const images = {
  icon_back,
  icon_import,
  icon_loading,
  icon_delete_black,
  icon_save,
  icon_doc,
  icon_add,

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

  icon_editor,
  icon_aim,
  icon_aim_disabled,
  icon_hand_point,
  icon_hand_point_disabled,

  icon_node_add,
  icon_node_delete,
  icon_node_edit,
  icon_node_move,
  icon_node_select,
  icon_submit_black,
  icon_close,

  icon_style_black,
  icon_symbol,

  icon_theme,
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

