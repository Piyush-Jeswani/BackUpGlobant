(function () {
  'use strict';

  angular.module('shopperTrak').directive('fixedHeaderTable', fixedHeaderTable);
  angular.module('shopperTrak').directive('loadMore', loadMore);
  angular.module('shopperTrak').directive('resize', resize);

  function fixedHeaderTable() {
    return {
      transclude: true,
      restrict: 'E',
      template: '<div class="scrollableContainer">' +
                  '<div class="headerSpacer"></div>' +
                  '<div load-more class="scrollArea" ng-transclude></div>' +
                '</div>',
      controller: fixedHeaderTableController
    };
  }

  function loadMore() {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var el = element[0];
        var unbindScrollBind = element.bind('scroll', function () {
          if(el.scrollTop + el.offsetHeight > el.scrollHeight - 20) {
            scope.$apply(attrs.loadMore);
            scope.$emit('load_more');
          }
        });

        scope.$on('$destroy', function() {
          if(typeof unbindScrollBind === 'function') {
            unbindScrollBind();
          }
        });
      }
    };
  }

  fixedHeaderTableController.$inject = [
    '$scope',
    '$element',
    '$attrs',
    '$timeout',
    '$q'
  ];

  resize.$inject = [
    '$timeout',
    '$compile'
  ];

  function fixedHeaderTableController($scope, $element, $attrs, $timeout, $q) {
    var tableController = this;
    var timer;
    var unbindScrollAreaWatch;

    var onResize = function() {
      $timeout(function () {
        tableController.renderTable();
      });

      $scope.$apply();
    }

    angular.element(window).on('resize', onResize);

    $scope.$on('$destroy', function() {
      angular.element(window).off('resize', onResize);

      if(typeof unbindScrollAreaWatch === 'function') {
        unbindScrollAreaWatch();
      }

      $timeout.cancel(timer);
      $scope = null;
      $element.remove();
      $element = null;
    });

    this.renderTable = function () {
      return waitForRender().then(fixHeaderWidths);
    };

    this.getTableElement = function() {
      return $element;
    };

    function waitForRender() {
      var deferredRender = $q.defer();
      function wait() {
        if($element === null) {
          deferredRender.reject();
        }

        if ($element && $element.find('table:visible').length === 0) {
          timer = $timeout(wait);
        } else {
          deferredRender.resolve();
        }
      }

      $timeout(wait);
      return deferredRender.promise;
    }

    var headersAreFixed = $q.defer();

    function fixHeaderWidths() {
      var headers = $element.find('thead th');

      _.each(headers, function(header) {
        var $header = angular.element(header);
        if($header.find('.th-inner').length === 0) {
          $header.wrapInner('<div class="th-inner"></div>');
        }
      });

      if($element.find('thead th .th-inner:not(:has(.box))').length) {
        $element.find('thead th .th-inner:not(:has(.box))').wrapInner('<div class="box"></div>');
      }

      $element.find('table th .th-inner:visible').each(function (index, el) {
        el = angular.element(el);
        var width = el.parent().width(),
          lastCol = $element.find('table th:visible:last'),
          headerWidth = width;
        if (lastCol.css('text-align') !== 'center') {
          var hasScrollbar = $element.find('.scrollArea').height() < $element.find('table').height();
          if (lastCol[0] === el.parent()[0] && hasScrollbar) {
            headerWidth += $element.find('.scrollArea').width() - $element.find('tbody tr').width();
            headerWidth = Math.max(headerWidth, width);
          }
        }

        width = _getScale(el.parent().css('width'));

        headerWidth = width;
        el.css('width', headerWidth);

      });

      headersAreFixed.resolve();
    }

    $element.find('.scrollArea').scroll(function (event) {
      $element.find('thead th .th-inner').css('margin-left', 0 - event.target.scrollLeft);
    });

    unbindScrollAreaWatch = $scope.$watch(function(){
      return $element.find('.scrollArea').width();
     }, function(newWidth, oldWidth) {
          if(newWidth * oldWidth <= 0) {
            return;
          }

        waitForRender().then(fixHeaderWidths);
    });

  }

  function resize($timeout, $compile) {
    return {
      restrict: 'A',
      require: '^fixedHeaderTable',
      link: function postLink(scope, elm, attrs, tableController){

        $timeout(function () {
          _init();
        });

        function _init() {
          var thInnerElms = elm.children();
          var thElm = thInnerElms.parent();
          var resizeRod = angular.element($compile('<div class="resize-rod" ng-mousedown="resizing($event)"></div>')(scope));
          thInnerElms.append(resizeRod);

          var thWidth = thElm.width();
          scope.header.width = thWidth;
          tableController.renderTable();
        }

        scope.resizing = function(e) {
          var screenOffset = tableController.getTableElement().find('.scrollArea').scrollLeft();
          var thInnerElm =  angular.element(e.target).parent();
          var thElm = thInnerElm.parent();
          var startPoint = _getScale(thInnerElm.css('left')) + thInnerElm.width() - screenOffset;
          var movingPos = e.pageX;

          var _document = angular.element(document);
          var _body = angular.element('body');
          var coverPanel = angular.element('.scrollableContainer .resizing-cover');
          var scaler = angular.element('<div class="scaler">');

          _body.addClass('scrollable-resizing');
          coverPanel.addClass('active');
          angular.element('.scrollableContainer').append(scaler);
          scaler.css('left', startPoint);

          _document.bind('mousemove', function(e) {
            var offsetX = e.pageX - movingPos;
            scaler.css('left', _getScale(scaler.css('left')) + offsetX);

            movingPos = e.pageX;
            e.preventDefault();
          });

          _document.bind('mouseup', function(e) {
            e.preventDefault();
            scaler.remove();
            _body.removeClass('scrollable-resizing');
            coverPanel.removeClass('active');
            _document.unbind('mousemove');
            _document.unbind('mouseup');

            var offsetX = _getScale(scaler.css('left')) - startPoint;
            var thWidth = thElm.width();

            thWidth += offsetX;

            scope.header.width = thWidth;
            thInnerElm.css('width', thWidth);
            tableController.renderTable();

            scope.$apply();
          });

        };

      }
    };

  }

  function _getScale(sizeCss){
    return parseInt(sizeCss.replace(/px|%/, ''), 10);
  }
})();
