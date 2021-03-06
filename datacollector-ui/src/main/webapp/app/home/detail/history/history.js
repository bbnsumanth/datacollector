/**
 * Copyright 2015 StreamSets Inc.
 *
 * Licensed under the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Controller for History.
 */

angular
  .module('dataCollectorApp.home')
  .controller('HistoryController', function ($rootScope, $scope, _, api, $modal) {

    angular.extend($scope, {
      showLoading: false,
      runHistory: [],

      /**
       * Refresh the History by fetching from server.
       */
      refreshHistory: function() {
        updateHistory($scope.activeConfigInfo.name);
      },

      /**
       * Show summary of the pipeline run.
       *
       * @param history
       * @param $index
       */
      viewSummary: function(history, $index) {
        var prevHistory,
          runHistory = $scope.runHistory;

        while($index + 1 < $scope.runHistory.length) {
          if(runHistory[$index + 1].status === 'STARTING') {
            prevHistory = runHistory[$index + 1];
            break;
          }
          $index++;
        }

        $modal.open({
          templateUrl: 'app/home/detail/history/summary/summaryModal.tpl.html',
          controller: 'SummaryModalInstanceController',
          size: 'lg',
          backdrop: 'static',
          resolve: {
            pipelineConfig: function() {
              return $scope.pipelineConfig;
            },
            history: function () {
              return history;
            },
            prevHistory: function() {
              return prevHistory;
            }
          }
        });
      },

      /**
       * Clear History Callback function.
       *
       * @param $event
       */
      clearHistory: function($event) {
        var modalInstance = $modal.open({
            templateUrl: 'app/home/detail/history/clearHistory/clearHistory.tpl.html',
            controller: 'ClearHistoryModalInstanceController',
            size: '',
            backdrop: 'static',
            resolve: {
              pipelineInfo: function () {
                return $scope.pipelineConfig.info;
              }
            }
          });

        if($event) {
          $event.stopPropagation();
        }

        modalInstance.result.then(function () {
          updateHistory($scope.pipelineConfig.info.name);
        }, function () {

        });
      }
    });

    var updateHistory = function(pipelineName) {
      $scope.showLoading = true;
      api.pipelineAgent.getHistory(pipelineName).
        success(function(res) {
          if(res && res.length) {
            $scope.runHistory = res;
          } else {
            $scope.runHistory = [];
          }
          $scope.showLoading = false;
        }).
        error(function(data) {
          $scope.showLoading = false;
          $rootScope.common.errors = [data];
        });
    };

    $scope.$on('onPipelineConfigSelect', function(event, configInfo) {
      if(configInfo) {
        updateHistory(configInfo.name);
      }
    });

    $scope.$watch('isPipelineRunning', function(newValue) {
      if($scope.pipelineConfig) {
        updateHistory($scope.pipelineConfig.info.name);
      }
    });

  });