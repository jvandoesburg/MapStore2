/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {connect} = require('react-redux');
const {createSelector} = require('reselect');
const {layerSettingSelector, layersSelector, groupsSelector} = require('../selectors/layers');
const {head, isArray} = require('lodash');
const {compose, defaultProps} = require('recompose');
const {hideSettings, updateSettings, updateNode, updateSettingsParams} = require('../actions/layers');
const {getLayerCapabilities} = require('../actions/layerCapabilities');
const {currentLocaleSelector} = require('../selectors/locale');
const {updateSettingsLifecycle} = require("../components/TOC/enhancers/tocItemsSettings");
const TOCItemsSettings = require('../components/TOC/TOCItemsSettings');
const defaultSettingsTabs = require('./tocitemssettings/defaultSettingsTabs');
const LayersUtils = require('../utils/LayersUtils');
const {mapLayoutValuesSelector} = require('../selectors/maplayout');
const {isAdminUserSelector} = require('../selectors/security');
const {setControlProperty} = require('../actions/controls');
const {toggleStyleEditor} = require('../actions/styleeditor');
const { initialSettingsSelector, originalSettingsSelector, activeTabSettingsSelector } = require('../selectors/controls');

const tocItemsSettingsSelector = createSelector([
    layerSettingSelector,
    layersSelector,
    groupsSelector,
    currentLocaleSelector,
    state => mapLayoutValuesSelector(state, {height: true}),
    isAdminUserSelector,
    initialSettingsSelector,
    originalSettingsSelector,
    activeTabSettingsSelector
], (settings, layers, groups, currentLocale, dockStyle, isAdmin, initialSettings, originalSettings, activeTab) => ({
    settings,
    element: settings.nodeType === 'layers' && isArray(layers) && head(layers.filter(layer => layer.id === settings.node)) ||
    settings.nodeType === 'groups' && isArray(groups) && head(groups.filter(group => group.id === settings.node)) || {},
    groups,
    currentLocale,
    dockStyle,
    isAdmin,
    initialSettings,
    originalSettings,
    activeTab
}));

/**
 * TOCItemsSettings plugin. This plugin allows to edit settings of groups and layers.
 * Inherit props from ResizableModal (dock = false) and DockPanel (dock = true) in cfg
 *
 * @class TOCItemsSettings
 * @memberof plugins
 * @static
 *
 * @prop cfg.dock {bool} true shows dock panel, false shows modal
 * @prop cfg.width {number} width of panel
 * @prop cfg.showFeatureInfoTab {bool} enable/disbale feature info settings
 * @prop cfg.enableIFrameModule {bool} enable iframe in template editor of feature info, default true
 * @prop cfg.hideTitleTranslations {bool} if true hide the title translations tool
 * @example
 * {
 *   "name": "TOCItemsSettings",
 *   "cfg": {
 *       "width": 300
 *    }
 * }
 */

const TOCItemsSettingsPlugin = compose(
    connect(tocItemsSettingsSelector, {
        onHideSettings: hideSettings,
        onUpdateSettings: updateSettings,
        onUpdateNode: updateNode,
        onRetrieveLayerData: getLayerCapabilities,
        onUpdateOriginalSettings: setControlProperty.bind(null, 'layersettings', 'originalSettings'),
        onUpdateInitialSettings: setControlProperty.bind(null, 'layersettings', 'initialSettings'),
        onSetTab: setControlProperty.bind(null, 'layersettings', 'activeTab'),
        onUpdateParams: updateSettingsParams,
        onToggleStyleEditor: toggleStyleEditor
    }),
    updateSettingsLifecycle,
    defaultProps({
        getDimension: LayersUtils.getDimension,
        getTabs: defaultSettingsTabs
    })
)(TOCItemsSettings);

module.exports = {
    TOCItemsSettingsPlugin
};
