function stats = computeDelays()

close all;
tr = importOscopeCSV;
t = tr(:,2);
t = t-t(1);
tr(:,2) = t;

% compute the DS0 observed period
tr2 = [zeros(1,size(tr,2)); tr];
tredges = diff(tr2(:,3));
idx = (tredges==1);
DS0times = tr(idx,2);
DS0u = mean(diff(DS0times));

% find the relative times
trel = mod(t,DS0u);
trel = round(trel*1000)/1000;
tr = [tr(:,2), trel, tr(:,3:end)];

% find rising and falling edges
trdiff = [tr(2:end,2:3), diff(tr(:,4:end))];

% determine delays
M = size(trdiff,2);
statsstr = struct('ID',[],'delays',[],'Tau',[],'Sigma',[],'MAD',[]);
stats = repmat(statsstr, M-2, 1);
for ii = 3:M
    jj = ii - 2;
    % the column id
    stats(jj).ID = ii;
    
    % the delays
    idx = (trdiff(:,ii)==1);
    X = trdiff(idx,1);
    stats(jj).delays = X;
    
    % the statistics
    stats(jj).Tau = mean(X);
    stats(jj).Sigma = std(X);
    stats(jj).MAD = mad(X);

    % plot the delays
    plotDelays(X)
    drawnow
    fname = sprintf('D%i.png',ii-3);
    gcf(), print(fname, '-dpng');
    
    % plot the histogram of delays
    plotDelayHistogram(X)
    drawnow
    fname = sprintf('D%i_hist.png',ii-3);
    gcf(), print(fname, '-dpng');
    
end

save('stats.mat','stats');
close all;

end

function plotDelays(X)
    plot(1e3*X)
    xlabel('ordered event index')
    ylabel('relative delay (ms)')
end

function plotDelayHistogram(X)
    h = histogram(X,100, 'Normalization', 'probability');
    ylabel('Probability')
    xlabel('Counts')
end
