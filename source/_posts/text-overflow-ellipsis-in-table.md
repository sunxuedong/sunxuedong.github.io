title: table表格里应用省略号text-overflow:ellipsis;
top: false
cover: true
password:
toc: true
mathjax: false
date: 2019-12-11 16:39:37
summary: 本文参考：ccs2.1中文版规范table部分 http://www.ayqy.net/doc/css2-1/tables.html#width-layout
tags:
- overflow
- table
categories:
- css
---

<div align="middle"><iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=115343&auto=1&height=66"></iframe></div>

本文参考：ccs2.1中文版规范 http://www.ayqy.net/doc/css2-1/cover.html   
                  ccs2.1中文版规范table部分 http://www.ayqy.net/doc/css2-1/tables.html#width-layout
                    
## 起因
接到需求，说如果 table 里的字太多就用省略号，很自然就想到 text-overflow:ellipsis (，注意：overflow: hidden; text-overflow:ellipsis; white-space:nowrap 一定要一起用)，但是在 table 中不起作用，问度娘，说要想起作用需给 table元素 设定 table-layout: fixed ，果然起作用了。
## text-overflow:ellipsis 起作用的前提
>1.一定要给容器定义宽度**（重点）**
>2.如果少了overflow: hidden;文字会横向撑到容易的外面
>3.如果少了white-space:nowrap;文字会把容器的高度往下撑；即使你定义了高度，省略号也不会出现，多余的文字会被裁切掉
>4.如果少了 text-overflow:ellipsis; 多余的文字会被裁切掉，就相当于你这样定义 text-overflow:clip

## 上面重点的前提
**一定要给容器定义宽度**，这就是 table-layout: fixed 起作用，而 table-layout: auto**(table元素默认 auto )** 不起作用的原因，下面一段来自 css2.1 中文版规范：
>**'table-layout'**
&emsp;&emsp;&ensp;*Value:*  auto | fixed | [inherit](http://www.ayqy.net/doc/css2-1/cascade.html#value-def-inherit)
&emsp;&emsp;&ensp;*Initial:*  auto
&emsp;&emsp;&ensp;*Applies to:*  'table'和'inline-table'元素
&emsp;&emsp;&ensp;*Inherited:*  no
&emsp;&emsp;&ensp;*Percentages:*  N/A
&emsp;&emsp;&ensp;*Media:*  [visual](http://www.ayqy.net/doc/css2-1/media.html#visual-media-group)
&emsp;&emsp;&ensp;*Computed value:*  与指定值相同

>['table-layout'](http://www.ayqy.net/doc/css2-1/tables.html#propdef-table-layout)属性控制用于表格单元，行和列布局的算法。值含义如下：
>
>**fixed**
&emsp;&emsp;&ensp;用固定表格布局算法
**auto**
&emsp;&emsp;&ensp;用任意自动表格布局算法

**(fixed和auto区别就是一个固定，一个自动)**

下文描述了这两种算法:
##### 在固定表格布局算法中(fixed)，每列的宽度由下述规则决定：
>1.一个 width 属性值不为'auto'的列元素所在的列宽度就设置为该宽度值
>2.否则，由第一行中 width 属性值不为'auto'的单元格确定该列的宽度。如果单元格跨越了多列，就把宽度分到这些列中(the width is divided over the columns)
>3.所有剩余列均分剩余的水平表格空间 (减去边框或单元格间距)

**3中说到，所有剩余列均分剩余的水平表格空间，实际情况就是table将剩余列的宽度平均分，固定每列的宽度就是 剩余宽度/剩余列数 ，text-overflow:ellipsis 起作用的前提就是一定要给容器定义宽度，所以fixed起作用了。**

##### 在自动表格布局算法中(fixed)，列宽由下列步骤决定：
>1.计算每个单元格的最小内容宽度(MCW)：格式化的内容可以跨越任意多行，但不能从单元格溢出。如果单元格指定的['width'](http://www.ayqy.net/doc/css2-1/visudet.html#propdef-width)(W)大于MCW，W就是最小单元格宽度。'auto'值表示MCW是最小单元格宽度，然后，计算每个单元格的“最大”宽度：格式化内容，不考虑除显式换行外的换行。
>2.对于每一列，从只跨越该列的单元格中确定一个最大和最小列宽。最小列宽是最小单元格宽度中最大的那个所需要的最小列宽（或者列['width'](http://www.ayqy.net/doc/css2-1/visudet.html#propdef-width)，看哪个更大）。最大列宽是最大单元格宽度中最大的那个所需要的最大列宽（或者列['width'](http://www.ayqy.net/doc/css2-1/visudet.html#propdef-width)，看哪个更大）。
>3.对于每个跨越多列的单元格，增加它跨越的列的最小宽度，让它们至少与单元格一样宽。对于最大宽度也这样处理。如果可能的话，把跨越的所有列再扩宽差不多相同宽度。
>4.对于每个'width'不为'auto'的列组元素，增加它跨越的列的最小宽度，让它们至少与列组的'width'一样宽。

**其实有些事很简单，但是说起来就是绕嘴。。。
1中说到，如果单元格指定的['width'](http://www.ayqy.net/doc/css2-1/visudet.html#propdef-width)(W)大于MCW，W就是最小单元格宽度。'auto'值表示MCW是最小单元格宽度。**

**情况一：当W > MCW时，W是最小单元格宽度，说明 列宽 = W，列宽 装得下文字，用不上省略号。**

**情况二：当W < MCW时，MCW是最小单元格宽度时，说明 列宽 = MCW，但是这个MCW是文字撑满下计算出来的，既然是撑满，用省略号干嘛。。。**

**要想在不使用table-layout:fixed的情况下，即table-layout:auto前提下用ellipsis，可以像下面这样做(在td里再套一个元素，对这个元素设置ellipsis)。**
``` html
<style>
    div {
      width: 100px;
    }
    .ellipsis {
      text-overflow:ellipsis;
      overflow: hidden; 
      text-overflow:ellipsis; 
      white-space:nowrap;
    }
</style>

...
<td>
  <div class="ellipsis">
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  </div>
</td>
...
```